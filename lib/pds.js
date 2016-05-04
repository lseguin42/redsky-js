/*!
 * @author        : lseguin <lseguin[at]student[dot]42[dot]fr>
 * @contributors  :
 * @date          : 2016-04-28 04:03:29
 * @version       : 0.1
 * @license       : MIT
 * @require       : html5
 */
(function (module_export) {
    
    /**
     * Tools
     */
    
    function inherit(daughter, mother) {
        daughter.prototype.__proto__ = mother.prototype;
    }
    
    function inheritController(ParentController) {
        
        /**
         * Class Controller
         *  - All Controllers herite this class
         */
        function Controller(element, Services)
        {
            this.$root = $(element);
            this.$ = this.$root.find.bind(this.$root);
            this._controllerName = this.$root.attr('pds-controller');
            this._bindDOMElements();
            // super method
            ParentController.call(this, Services);
        }
        inherit(Controller, ParentController);
        
        /**
         * Bind dom element
         */
        Controller.prototype._bindDOMElements = function () {
            var self = this;
            
            var attrName = 'pds-bind-' + self._controllerName;
            self.$('[' +  attrName + ']')
            .each(function () {
            var elem = $(this)
            var name = '$' + elem.attr(attrName);
            
            if (self[name])
                self[name] = self[name].add(elem);
            else
                self[name] = elem;
            });
        }
        
        return Controller;
    }
    
    function inheritService(ParentService) {
       
        /**
         * Class Service
         *  - All Service herite this class
         */
        function Service(Services) {
            console.log('SERVICE');
            ParentService.call(this, Services);
        }
        inherit(Service, ParentService);
        
        return Service;
    }
    
    /**
     * PDS Application Class
     */
    function PDSApplication() {
        var self = this;
        
        self.debug = [
            'LOG',
            'ERROR',
            'WARNING'
        ];
        
        var deferred = Q.defer();
        self.isReady = deferred.promise;
        
        /**
         * In the future
         */
        self.configs = {
            
        };
        
        /**
         * Controllers Register in PDS Application
         */
        self.controllers = {
            /**
             * Instances[] of controller
             */
            instances : {},
            /**
             * Class of controller
             */
            class : {},
            /**
             * Services dependencies
             */
            dependencies : {}
        }
        
        /**
         * Services Register in PDS Application
         */
        self.services = {
            /**
             * Instances of services
             */
            instances : {},
            /**
             * Class of services
             */
            class : {},
            /**
             * Service dependencies
             */
            dependencies : {},
        };
        
        /**
         * Validators Register in PDS Application
         */
        self.validators = {
        }
        
        if (typeof jQuery != "undefined") {
            self._jQueryExtendMethod();
            jQuery(function($) {
                deferred.resolve();
                self.log('PDS Application is ready...');
            });
        } else {
            throw new Error('Require JQuery...');
        }
    }
    
    PDSApplication.prototype._jQueryExtendMethod = function () {
        var self = this;
        
        jQuery.fn.extend({
            pdsValid: function () {
                this.each(function () {
                    var elem = $(this);
                    if (!elem.is(':valid'))
                        throw new Error("html5 not valid");
                    var validator = elem.attr('pds-validator');
                    if (!validator)
                        return ;
                    if (!self.validators[validator]) {
                        var msg = "Validator [" + validator + "] not registered...";
                        self.error(msg);
                        throw new Error(msg);
                    }
                    if (self.validators[validator].call(this) === false) {
                        throw new Error("Validator [" + validator + "] return false");
                    }
                });
                return true;
            }
        });
    }
    
    PDSApplication.prototype.log = function (msg) {
        var self = this;
        
        if (self.debug.indexOf('LOG') != -1)
            console.log.bind(console, '[LOG]:').apply(null, arguments);
    }
    
    PDSApplication.prototype.warning = function () {
        var self = this;
        
        if (self.debug.indexOf('WARNING') != -1)
            console.warning.bind(console, '[WARNING]:').apply(null, arguments);
    }
    
    PDSApplication.prototype.error = function () {
        var self = this;
        
        if (self.debug.indexOf('ERROR') != -1)
            console.error.bind(console, '[ERROR]:').apply(null, arguments);
    }
   
    /**
     * Register controller in PDS Application
     */
    PDSApplication.prototype.controller = function (name, ControllerClass, serviceDependencies)
    {
        var self = this;
        
        var Controller = inheritController(ControllerClass);
        
        if (self.controllers.class[name]) {
            throw new Error("Controller [" + name + "] already registered.");
        }
        
        self.controllers.class[name] = Controller;
        self.controllers.dependencies[name] = serviceDependencies || [];
        self.controllers.instances[name] = [];
        
        self.isReady.then(function () {
            $("[pds-controller='" + name + "']").each(function () {
                var rootDOM = this;
                try {
                    var services = self.getAllServices(serviceDependencies);
                    var controller = new Controller(rootDOM, services);
                    self.log('instanciate controller', name);
                    self.controllers.instances[name].push(controller);
                } catch (e) {
                    self.error(e);
                }
            });
        });
        
        self.log('register controller', name);
    }
    
    /**
     * Register validator in PDS Application
     */
    PDSApplication.prototype.validator = function (name, callback) {
        var self = this;
        
        if (self.validators[name]) {
            throw new Error("Validator [" + name + "] already registered");
        }
        self.validators[name] = callback;
        self.log('register validator', name);
    }
    
    /**
     * Register service in PDS Application
     */
    PDSApplication.prototype.service = function (name, ServiceClass, serviceDependencies)
    {
        var self = this;
        
        var Service = inheritService(ServiceClass);
        
        if (self.services.class[name]) {
            throw new Error("Service [" + name + "] already registered.");
        }
        
        self.services.class[name] = Service;
        self.services.dependencies[name] = serviceDependencies || [];
        
        self.log('register service', name);
    }
    
    /**
     * Get Services List by name
     * @return Services{}
     */
    PDSApplication.prototype.getAllServices = function (servicesList) {
        var self = this;
        
        var services = {};
        if (!servicesList)
            servicesList = [];
        servicesList.forEach(function (serviceName) {
            services[serviceName] = self.getService(serviceName);
        });
        return services;
    }
    
    /**
     * Get Service by name
     * @return Service
     */
    PDSApplication.prototype.getService = function (name) {
        var self = this;
       
        if (!self.isReady.isFulfilled())
            throw new Error('Application is not ready');
            
        if (!self.services.class[name])
            throw new Error('Service [' + name + '] not registered');
        
        if (!self.services.instances[name]) {
            var servicesDependencies = self.getAllServices(self.services.dependencies[name]);
            self.services.instances[name] = new self.services.class[name](servicesDependencies);
            self.log('instanciate service', name);
        }
        
        return self.services.instances[name];
    }
    
    /**
     * Config application
     */
    PDSApplication.prototype.config = function ()
    {
        throw "Not implemented";
    }
    
    /**
     * declare pds application in global scope
     */
    module_export.pds = new PDSApplication();
    
})(window);
