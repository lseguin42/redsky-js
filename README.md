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
