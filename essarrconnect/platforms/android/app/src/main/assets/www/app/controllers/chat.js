(function() {
    'use strict';

    angular
        .module('app')
        .controller('ChatController', ChatController);

    ChatController.$injector = ['$scope', '$rootScope', '$location', '$nativeDrawer', '$timeout', 'Login', 'User', 'Dashboard'];

    function ChatController($scope, $rootScope, $location, $nativeDrawer, $timeout, Login, User, Dashboard){
        StatusBar.backgroundColorByHexString('#219787');
        StatusBar.styleLightContent();

        $scope.title = 'Employee Question Threads'
        $scope.all_threads = []
        $scope.new_message = null
        $scope.thread = {
        	'user_message_1': null,
        	'user_message_2': null,
        	'admin_message_1': null,
        	'admin_message_2': null
        }

        var INDEX = 0; 
        $scope.startThread = ()=>{
        	let index
        	if(!$scope.thread.user_message_1){
        		$scope.thread.user_message_1 = $scope.new_message
        		index = 1
        	}else if(!$scope.thread.user_message_2){
        		$scope.thread.user_message_2 = $scope.new_message
        		index = 2
        	}
        	$scope.new_message = ''
        	generate_message($scope.new_message, 'self', index);
        	if(index == 1){
	        	Dashboard.addThread($scope.thread).then((result)=>{
	        		if(result.data.status){
	        			$scope.showLoader = true        			
	        			$scope.getThreads()
	        		}else{
	        			showBottom(result.data.message)
	        		}
	        	}).catch((err)=>{
					showBottom(err)
	        	})
        	}else{
				Dashboard.updateThread($scope.thread).then((result)=>{
	        		if(result.data.status){
	        			$scope.showLoader = true        			
	        			$scope.getThreads()
	        		}else{
	        			showBottom(result.data.message)
	        		}
	        	}).catch((err)=>{
					showBottom(err)
	        	})
        	}
        }

        $scope.getThreads = ()=>{
        	$scope.showLoader = true
        	Dashboard.getThreads().then((result)=>{
        		$scope.showLoader = false
        		if(result.data.status){
        			$scope.all_threads = result.data.data
        			_.each($scope.all_threads, (thread)=>{
        				if(thread.user_message_1 && !thread.admin_message_1){
        					thread.replied_1 = false
        					thread.replied_2 = true
        				}else if(thread.user_message_2 && !thread.admin_message_2){
        					thread.replied_1 = true
        					thread.replied_2 = false
        				}else{
        					thread.replied_1 = true
        					thread.replied_2 = true
        				}
        				thread.admin_message_1_temp = thread.admin_message_1
        				thread.admin_message_2_temp = thread.admin_message_2
        			})
        		}else{
        			showBottom(result.data.message)
        		}
        	})
        }

        $scope.toggleThreadStatus = (index)=>{
        	$scope.all_threads[index].status = !$scope.all_threads[index].status
        	$scope.all_threads[index].submitting = true
        	$scope.all_threads[index].replied_1 = true
        	$scope.all_threads[index].replied_2 = true
        	showBottom(`${$scope.all_threads[index].status?'Closing':'Re-Opening'} thread..`)
        	console.log("$scope.updateThread", index, $scope.all_threads[index])
        	Dashboard.updateThread($scope.all_threads[index]).then((result)=>{
        		$scope.getThreads()
        		if(result.data.status){
        			showBottom("Thread status changed successfully")
        		}else{
        			showBottom("Something went wrong! Please try again")
        		}
        	})
        }

        $scope.updateThread = (index)=>{
        	$scope.all_threads[index].submitting = true
        	$scope.all_threads[index].replied_1 = true
        	$scope.all_threads[index].replied_2 = true
        	showBottom("Sending reply..")
        	console.log("$scope.updateThread", index, $scope.all_threads[index])
        	Dashboard.updateThread($scope.all_threads[index]).then((result)=>{
        		$scope.getThreads()
        		if(result.data.status){
        			showBottom("Reply sent successfully")
        		}else{
        			showBottom("Something went wrong! Please try again")
        		}
        	})
        }

        $scope.getThreads()
		  // $("#chat-submit").click(function(e) {
		  //   e.preventDefault();
		  //   var msg = $("#chat-input").val(); 
		  //   if(msg.trim() == ''){
		  //     return false;
		  //   }
		  //   generate_message(msg, 'self');
		  //   var buttons = [
		  //       {
		  //         name: 'Existing User',
		  //         value: 'existing'
		  //       },
		  //       {
		  //         name: 'New User',
		  //         value: 'new'
		  //       }
		  //     ];
		  //   setTimeout(function() {      
		  //     generate_message(msg, 'user');  
		  //   }, 1000)
		    
		  // })
		  
		  function generate_message(msg, type, index) {
		    $scope.all_threads.unshift($scope.thread)
		    $("#cm-msg-"+index).hide().fadeIn(300);
		    if(type == 'self'){
		     $("#chat-input").val(''); 
		    }    
		    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);    
		  }  

		  function showBottom(message) {
		      window.plugins.toast.showWithOptions(
		        {
		          message: message,
		          duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
		          position: "bottom",
		          addPixelsY: -40  // added a negative value to move it up a bit (default 0)
		        },
		        function(){}, // optional
		        function(){}    // optional
		      );
		    }
		  
		  function generate_button_message(msg, buttons){    
		    /* Buttons should be object array 
		      [
		        {
		          name: 'Existing User',
		          value: 'existing'
		        },
		        {
		          name: 'New User',
		          value: 'new'
		        }
		      ]
		    */
		    INDEX++;
		    var btn_obj = buttons.map(function(button) {
		       return  "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\""+button.value+"\">"+button.name+"<\/a><\/li>";
		    }).join('');
		    var str="";
		    str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg user\">";
		    str += "          <span class=\"msg-avatar\">";
		    str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
		    str += "          <\/span>";
		    str += "          <div class=\"cm-msg-text\">";
		    str += msg;
		    str += "          <\/div>";
		    str += "          <div class=\"cm-msg-button\">";
		    str += "            <ul>";   
		    str += btn_obj;
		    str += "            <\/ul>";
		    str += "          <\/div>";
		    str += "        <\/div>";
		    $(".chat-logs").append(str);
		    $("#cm-msg-"+INDEX).hide().fadeIn(300);   
		    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);
		    $("#chat-input").attr("disabled", true);
		  }
		  
		  $(document).delegate(".chat-btn", "click", function() {
		    var value = $(this).attr("chat-value");
		    var name = $(this).html();
		    $("#chat-input").attr("disabled", false);
		    generate_message(name, 'self');
		  })
		  
		  $("#chat-circle").click(function() {    
		    $("#chat-circle").toggle('scale');
		    $(".chat-box").toggle('scale');
		  })
		  
		  $(".chat-box-toggle").click(function() {
		    $("#chat-circle").toggle('scale');
		    $(".chat-box").toggle('scale');
		  })

      }
})()