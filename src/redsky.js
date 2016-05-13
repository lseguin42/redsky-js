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
            var binds = self.$('[rds-bind]');
            
            self.$('[rds-controller] [rds-bind]')
              .each(function () {
                binds.splice(binds.index(this), 1);
            });
            
            binds.each(function () {
                var elem = $(this)
                var name = '$' + elem.attr('rds-bind');
                
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
            ParentService.call(this, Services);
        }
        inherit(Service, ParentService);
        
        return Service;
    }
    
    /**
     * RDS Application Class
     */
    function RDSApplication() {
        var self = this;
        
        var deferred = Q.defer();
        self.isReady = deferred.promise;
        
        /**
         * In the future
         */
        self.configs = {
            
        };
        
        /**
         * Controllers Register in RDS Application
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
         * Services Register in RDS Application
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
         * Validators Register in RDS Application
         */
        self.validators = {
        }
        
        if (typeof jQuery != "undefined") {
            self._jQueryExtendMethod();
            jQuery(function() {
                self._run(deferred);
            });
        } else {
            throw new Error('Require JQuery...');
        }
    }
    
    /**
     * Init all Controllers on RDS Application is ready
     * @private
     */
    RDSApplication.prototype._run = function (deferred) {
        var self = this;

        if (self.isReady.isFulfilled())
            throw new Error("Application is already started.");
        if (deferred.promise !== self.isReady)
            throw new Error("Deferred given error.");
        deferred.resolve();
        self.log('RDS Application is ready...');
        $('[rds-controller]').each(function () {
            var elem = $(this);
            var name = elem.attr('rds-controller');
            var Controller = self.controllers.class[name];
            if (!Controller)
                self.error("Controller [" + name + "] isn't registered.");
            var dependencies = self.controllers.dependencies[name];
            var services = self.getAllServices(dependencies);
            var controller = new Controller(this, services);
            self.log('instanciate controller', name);
            self.controllers.instances[name].push(controller);
        });
    }
    
    /**
     * @private
     */
    RDSApplication.prototype._jQueryExtendMethod = function () {
        var self = this;
        
        jQuery.fn.extend({
            rdsValid: function () {
                this.each(function () {
                    var elem = $(this);
                    if (!elem.is(':valid'))
                        throw new Error("html5 not valid");
                    var validator = elem.attr('rds-validator');
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
            },
            /*
            watch: function (name, fn) {
                if (typeof name === 'function') {
                    fn = name;
                    name = null;
                }
                console.log('watch');
                this.each(function () {
                    if (!this.__rds_observer__) {
                        this.__rds_observer__ = new MutationObserver(function(mutations) {
                            mutations.forEach(function (mutation) {
                                console.log(mutation);
                            });
                        });
                        console.log('observer added', this);
                        var config = { attributes: true };
                        this.__rds_observer__.observe(this, config);
                        this.__rds_observer__.events = [];
                    }
                    this.__rds_observer__.events.push({ name: name, fn: fn });
                });
            }
            */
        });
    }
    
    RDSApplication.prototype._listAuthorizedLog = function () {
        var self  = this;
        var types = [ 'error', 'warn', 'log' ];
        var res   = [ ];
        
        var level = (self._level === 0 ? 1 : self._level);
        level = level || types.length;
        var exclusive = level < 0;
        level = (exclusive ? -level : level);
        
        if (level > types.length)
            return res;
        if (exclusive)
            return [ types[types.length - level] ];
        for (var i = 0; i <= types.length - level; i++) {
            res.push(types[i]);
        }
        return res;
    }
    
    /**
     * Active debug mode
     */
    RDSApplication.prototype.debug = function (level) {
        var self = this;
        
        self._level = level;
        
        var s = ""
        self._listAuthorizedLog().forEach(function (str) {
            if (s !== "")
                s += ", "
            s += str;
        });
        console.log('[DEBUG]: ReDSky debug display [', s, ']');
    }
    
    /**
     * Log value autorized of global __REDSKY_DEGUG_LEVEL__
     * 
     * 0|1 => display [log, warning, error]
     * 2   => display [warning, error]
     * 3   => display [error]
     * 
     * -1  => display [log]
     * -2  => display [warning]
     * -3  => display [error]
     */
    RDSApplication.prototype._console = function (type) {
        var self = this;
        
        type = type.toLowerCase();
        if (self._listAuthorizedLog().indexOf(type) !== -1)
            return console[type].bind(console, '[' + type.toUpperCase() + ']:');
        return function noop(){};
    }
    
    Object.defineProperty(RDSApplication.prototype, 'log', {
        get: function () {
            return this._console('log');
        }
    });
    
    Object.defineProperty(RDSApplication.prototype, 'warn', {
        get: function () {
            return this._console('warn');
        }
    });
    
    Object.defineProperty(RDSApplication.prototype, 'error', {
        get: function () {
            return this._console('error');
        }
    });
   
    /**
     * Register controller in RDS Application
     */
    RDSApplication.prototype.controller = function (name, ControllerClass, serviceDependencies)
    {
        var self = this;
        
        var Controller = inheritController(ControllerClass);
        
        if (self.controllers.class[name]) {
            throw new Error("Controller [" + name + "] already registered.");
        }
        
        self.controllers.class[name] = Controller;
        self.controllers.dependencies[name] = serviceDependencies || [];
        self.controllers.instances[name] = [];
        
        self.log('register controller', name);
    }
    
    /**
     * Register validator in RDS Application
     */
    RDSApplication.prototype.validator = function (name, callback) {
        var self = this;
        
        if (self.validators[name]) {
            throw new Error("Validator [" + name + "] already registered");
        }
        
        self.validators[name] = callback;
        
        self.log('register validator', name);
    }
    
    /**
     * Register service in RDS Application
     */
    RDSApplication.prototype.service = function (name, ServiceClass, serviceDependencies)
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
    RDSApplication.prototype.getAllServices = function (servicesList) {
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
    RDSApplication.prototype.getService = function (name) {
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
    RDSApplication.prototype.config = function ()
    {
        throw "Not implemented";
    }
    
    /**
     * declare rds application in global scope
     */
    var redsky = new RDSApplication();
    
    module_export.redsky = redsky;
    
    if (typeof __REDSKY_DEGUG_LEVEL__ == 'number') {
        redsky.debug(__REDSKY_DEGUG_LEVEL__);
    }
    
})(window);
