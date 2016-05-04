PDS Application
===============================
Micro Frameworks Front Home Made
________________________________
  
  * Controller
    
    Pour déclarer un controller :
    - pds.controller('ControllerName', ControllerClass, [ 'DependenciesServiceName', ... ]);
    
    Pour chaque element du DOM avec l'attribute "pds-controller='ControllerName'"
    une instance de "ControllerClass" sera créée avec en premier parametre un dictionnaire des services en dépendance
      
    dans le scope du controller tous les éléments DOM avec l'attribute "pds-bind-controllername='variableName'"
    seront automatiquement binder au controller.
    pour y accéder dans le controller : "this.$variableName".
    
    le controller possède des shortcuts :
    - this.$('tagName') // est un selecteur jQuery depuis le rootElement
    - this.$root // est le rootElement jQuery (this.$root.find('tagName') === this.$('tagName'))
  
    Exemple :
      
    index.html
    ```html
    <div pds-controller='ControllerName'>
        <input pds-bind-controllername='myInput' name='inputName' value='my data'>
    </div>
    ```
    
    controller.js
    ```javascript
    function ControllerClass(Services)
    {
        this.$myInput.val() // "my data"
        this.$myInput.attr('name') // "inputName"
    }

    pds.controller('ControllerName', ControllerClass);
    ```
  
  * Service
    
    Pour déclarer un service :
    - pds.service('ServiceName', ServiceClass, [ 'DependenciesServiceName', ... ]);
  
    Un service est instancié qu'une seul fois. La même instance est partagé entre tous vos Controllers et/ou Services.
    Utilisez un Service si vous devez communiquer entre deux controllers par exemple.
    Un service ne doit pas modifier ou se binder avec le DOM.
    Un service est instancié uniquement si il est requis.

  * Validator
  
    Pour déclarer un validator :
    - pds.validator('ValidatorName', callback);
    
    Un validator est exécuté si sur un element du DOM vous avez la property pds-validator="ValidatorName"
    Et que vous appellez sur cette element jQuery pdsValid().
    
    Exemple :
    
    Use validator in DOM
    ```html
    <div>
        <input id="inputToValid" pds-validator="ValidatorNegatif" value="5" />
    </div>
    ```
    
    Register validator :
    ```javascript
    pds.validator('ValidatorNegatif', function () {
        var elem = $(this);
        if (parseInt(elem.val()) >= 0) {
            throw new Error("Pas négatif...");
        }
    });
    ```
    
    Trigger validator :
    ```javascript
    $('#inputToValid').pdsValid();
    ```
    