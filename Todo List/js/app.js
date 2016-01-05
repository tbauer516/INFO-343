'use strict';

angular.module('TodoApp', ['angular.panels', 'ui.router', 'ui.bootstrap', 'firebase', 'ui.tinymce'])

.config(['panelsProvider', '$stateProvider', '$urlRouterProvider', function(panelsProvider, $stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'partials/home.html',
            controller: 'TodoCtrl'
        })
        .state('edit', {
            url: '/edit',
            templateUrl: 'partials/edit.html',
            controller: 'newNoteCtrl'
        })
        .state('re-edit', {
            url: '/edit/{id}',
            templateUrl: 'partials/edit.html',
            controller: 'newNoteCtrl'
        });

    panelsProvider
        .add({
            id: 'sideBar',
            position: 'left',
            size: Math.max(300, window.innerWidth / 2) + 'px',
            templateUrl: 'partials/sideBar.html',
            controller: 'sideBarCtrl'
        });

    $urlRouterProvider.otherwise('/#');
}])

// parent controller that houses all the ui-views
// put all global functions and variables here to access them from
// the other ui-views
.controller('TodoCtrl', ['$scope', '$uibModal', '$firebaseAuth', '$firebaseArray', '$firebaseObject', '$stateParams', 'panels', '$sce', function($scope, $uibModal, $firebaseAuth, $firebaseArray, $firebaseObject, $stateParams, panels, $sce) {

    //reference to the app
    var ref = new Firebase("https://khtj-todo-list.firebaseio.com/");

    //make the Auth service for this app
    var Auth = $firebaseAuth(ref);

    //reference to a value in the JSON in the Sky
    var valueRef = ref.child('TodoList');
    if (valueRef === undefined) {
        ref.push().set({
            'TodoList': []
        });
        valueRef = ref.child('TodoList');
    }
    $scope.list = $firebaseArray(valueRef);
    $scope.home = $firebaseArray(valueRef);

    // signUp function that chains and calls signIn afterwards
    $scope.signUp = function(email, password) {
        console.log("creating user " + email + ', ' + password);
        //pass in an object with the new 'email' and 'password'
        var promise = Auth.$createUser({
                'email': email,
                'password': password
            })
            .catch(function(error) {
                return error;
            })
        return promise;
    };

    // if trash is clicked, delete review
    $scope.delete = function(item) {
        $scope.list.$remove(item);
    };

    //separate signIn function
    $scope.signIn = function(email, password) {
        console.log(email + ', ' + password);
        var promise = Auth.$authWithPassword({
                'email': email,
                'password': password
            })
            .catch(function(error) {
                return error;
            });
        return promise;
    };

    //Make LogOut function available to views
    $scope.logOut = function() {
        Auth.$unauth(); //"unauthorize" to log out
    };

    //Any time auth status updates, set the userId so we know
    Auth.$onAuth(function(authData) {
        if (authData) { //if we are authorized
            $scope.userId = authData.uid;
            $scope.userName = authData.password.email;
        } else {
            $scope.userId = undefined;
            $scope.userName = undefined;
        }
    });

    //Test if already logged in (when page load)
    var authData = Auth.$getAuth(); //get if we're authorized
    $scope.loggedIn = authData; // easy variable to test if logged in
    if (authData) {
        $scope.userId = authData.uid;
    }

    // opens the login modal
    $scope.open = function() {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/login-modal.html',
            controller: 'ModalInstanceCtrl',
            windowClass: 'full-modal',
            scope: $scope // pass in the parent scope, so that functions
                // are availible to be called from here
        });

    }

    $scope.sideBarOpen = function() {
        $scope.$broadcast('leftBarOpen', {});
        console.log('sent');
    }

    $scope.formatTime = function(time) {
        return new Date(time).toLocaleString();
    }

    $scope.formatPrivate = function(isPrivate) {
        var format = 'Public';
        if (isPrivate) {
            format = 'Private';
        }
        return format;
    }

    $scope.renderHtml = function(html_code) {
        return $sce.trustAsHtml(html_code);
    }

}])

// separate controller for the edit page
.controller('newNoteCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {

    $scope.private = true;

    $scope.id = $stateParams.id;
    if ($scope.id != undefined) {
        $scope.title = $scope.list[$scope.id].title;
        $scope.body = $scope.list[$scope.id].body;
        $scope.tagText = $scope.list[$scope.id].tagText;
        $scope.private = $scope.list[$scope.id].private;
        var author = $scope.list[$scope.id].author;
    }

    // creates new note and appends it to firebase cloud Json
    $scope.newNote = function() {
        var newItem = {
            title: $scope.title,
            body: $scope.body,
            tagText: $scope.tagText,
            author: $scope.userName,
            time: Firebase.ServerValue.TIMESTAMP,
            'private': $scope.private
        };
        console.log(newItem)
        $scope.$parent.list.$add(newItem);
        $scope.$parent.list.$save();
    }

    $scope.editNote = function() {
        $scope.$parent.list[$scope.id].title = $scope.title;
        $scope.$parent.list[$scope.id].body = $scope.body;
        $scope.$parent.list[$scope.id].tagText = $scope.tagText;
        $scope.$parent.list[$scope.id].private = $scope.private;
        $scope.$parent.list.$save($scope.$parent.list[$scope.id]);
    }

    $scope.inputTags = [];

    $scope.addTag = function() {
        if ($scope.tagText.length == 0) {
            return;
        }
        $scope.inputTags.push({
            name: $scope.tagText
        });
        $scope.tagText = '';
    }

    $scope.tinymceOptions = {
        mode: 'exact',
        inline: false,
        skin: 'lightgray',
        theme: 'modern',
        height: 300,
        content_css: 'css/tinymce.css',
        plugins: [
            'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
            'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
            'save table contextmenu directionality emoticons template paste textcolor'
        ],
        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons'
    };

}])


.controller('sideBarCtrl', ['$scope', 'panels', '$uibModal', '$sce', function($scope, panels, $uibModal, $sce) {

    $scope.$on('leftBarOpen', function(event, args) {
        panels.open('sideBar');
    });

    $scope.renderHtml = function(html_code) {
        return $sce.trustAsHtml(html_code);
    }

    $scope.enlarge = function(id) {

        var body = document.querySelector('body');
        $scope = angular.element(body).scope();

        $scope.itemID = id;
        $scope.item = $scope.list[id];

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/large-note.html',
            controller: 'ModalInstanceCtrl',
            windowClass: 'full-modal',
            size: 'lg',
            scope: $scope
        });

    }

}])


// separate controller for the login modal
.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {

    // either signUp or signIn was pressed. Determines which was pressed and calls
    // the appropriate method to use. Also closes modal.
    $scope.ok = function(messageType) {
        $scope.loginError = undefined;
        if (messageType == 'signup') {
            $scope.signUp($scope.email, $scope.password)
                .then(function(error) {
                    $scope.loginError = error.message;
                    console.log(error.message);
                })
                .then(function() {
                    if ($scope.loginError == undefined) {
                        $scope.signIn($scope.email, $scope.password)
                        .then(function(error) {
                            $scope.loginError = error.message;
                            console.log(error.message);
                        })
                        .then(function() {
                            if ($scope.loginError == undefined) {
                                $uibModalInstance.close();
                            }
                        });
                    }
                });
        } else if (messageType == 'login') {
            $scope.signIn($scope.email, $scope.password)
                .then(function(error) {
                    $scope.loginError = error.message;
                    console.log(error.message);
                })
                .then(function() {
                    if ($scope.loginError == undefined) {
                        $uibModalInstance.close();
                    }
                });
        }
    };

    // closes modal
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]);