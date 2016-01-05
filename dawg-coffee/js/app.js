'use strict';

angular.module('CoffeeApp', ['ui.router', 'ui.bootstrap'])
.config(function($stateProvider){
	$stateProvider
		.state('home', {
			url: '/', //"root" directory
			templateUrl: 'partial/home.html',
			controller: 'HomeCtrl'
		})
		.state('orders', {
			url: '/orders', // order page with different beans
			templateUrl: 'partial/order.html',
			controller: 'OrderCtrl'
		})	
		.state('detail', {
			url: '/orders/{id}', //specific detail page of each type
			templateUrl: 'partial/bean-detail.html',
			controller: 'DetailCtrl'
		})
		.state('cart', {
			url: '/cart', //shopping cart
			templateUrl: 'partial/cart.html',
			controller: 'CartCtrl'
		})
})

.config(function($urlRouterProvider){
 
 	// if not valid URL, reroutes to home page
    $urlRouterProvider.otherwise('/');

})

.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {
	// empty control for home page
}])


.controller('OrderCtrl', ['$scope', '$http', function($scope, $http) {

	// save all bean types as 'products'
	$http.get('data/products.json').then(function(response) {
 		$scope.products = response.data;
 	});

}])


.controller('DetailCtrl', ['$scope', '$http', '$stateParams', '$filter', 'CartService', function($scope, $http, $stateParams, $filter, CartService) {

	// get data for and set default values for the specific bean type clicked
	$http.get('data/products.json').then(function(response) {
   	$scope.product = $filter('filter')(response.data, { //filter the array
      id: $stateParams.id //for items whose id property is targetId
   	}, true)[0];
   	$scope.quantity = 1;
   	$scope.grindName = $scope.product.categories[0];
 	});

	// cart service to save and share shopping cart accross controls
 	$scope.CartService = CartService;

}])


.controller('CartCtrl', ['$scope', '$http', '$uibModal', 'CartService', function($scope, $http, $uibModal, CartService) {

	$scope.CartService = CartService;

	// purchase button opens modal and clears carts
	$scope.purchase = function() {

		var modalInstance = $uibModal.open({
			templateUrl: 'partial/modal-purchase.html',
			controller: 'SelectModalCtrl',
			scope: $scope
		});
		localStorage.removeItem('cart');
		CartService.shoppingCart = [];
	}

	$scope.delete = function(index) {
		CartService.shoppingCart.splice(index, 1);
		localStorage.setItem('cart', angular.toJson(CartService.shoppingCart));
	}

	$scope.plus = function(index) {
		if (CartService.shoppingCart[index].quantity < 10) {
			CartService.shoppingCart[index].quantity++;
			localStorage.setItem('cart', angular.toJson(CartService.shoppingCart));
		}
	}

	$scope.minus = function(index) {
		if (CartService.shoppingCart[index].quantity > 1) {
			CartService.shoppingCart[index].quantity--;
			localStorage.setItem('cart', angular.toJson(CartService.shoppingCart));
		}
	}

}])

.controller('SelectModalCtrl', function($scope, $http, $uibModalInstance) {

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

})

.controller('ScrollCtrl', function($scope, $location, $anchorScroll) {
   $scope.scrollTo = function(id) {
      $location.hash(id);
      $anchorScroll();
   }
})

.factory('CartService', function() {

	var cart = {};

	cart.shoppingCart = [];

	if (localStorage.getItem('cart') != null) {
		cart.shoppingCart = angular.fromJson(localStorage.getItem('cart'));
	}

	// adds the given data to the cart as a new bean object
	// additionally performs checks to make sure quantity is valid
	cart.addToCart = function(name, grind, quantity, price) {
		var totalQuantity = 0;
		for (var i = 0; i < cart.shoppingCart.length; i++) {
			totalQuantity += cart.shoppingCart[i].quantity;
		}
		if (quantity <= 10) {
			var next = {
				'name': name,
				'grind': grind,
				'quantity': quantity,
				'price': price,
				'index': cart.shoppingCart.length
			};
			if (cart.shoppingCart.length == 0) {
				cart.shoppingCart[0] = next;
			} else  {
				var toAdd = true;
				for (var i = cart.shoppingCart.length - 1; i >= 0; i--) {
					if (cart.equals(next, cart.shoppingCart[i])) {
						cart.shoppingCart[i].quantity = Math.min(cart.shoppingCart[i].quantity + next.quantity, 10);
						toAdd = false;
						break;
					}
				}
				if (toAdd) {
					cart.shoppingCart[cart.shoppingCart.length] = next;
				}
			}
			localStorage.setItem('cart', angular.toJson(cart.shoppingCart));
		}
	}

	// custom equals function for the addToCart function
	cart.equals = function(item1, item2) {
		return ((item1.name == item2.name) && (item1.grind == item2.grind));
	}

	cart.total = function() {
		var total = 0;
		for (var i = 0; i < cart.shoppingCart.length; i++) {
			total += cart.shoppingCart[i].quantity * cart.shoppingCart[i].price;
		}
		return total;
	}

	return cart;
})

// custom filter to capitalize first letter of each word
.filter('capitalize', function() {
	return function(input, scope) {
		input = input.toLowerCase();
		var chunks = input.split(' ');
		for (var i = 0; i < chunks.length; i++) {
			chunks[i] = chunks[i].substring(0,1).toUpperCase()+chunks[i].substring(1);
		}
		return chunks.join(' ');
	}
});