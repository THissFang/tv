//**********************************************************************
//    互动门户移动焦点效果及事件JS框架
//  creator    : 胡忠雨
//  created on : 2014-05-29
//  last Update: 2014-06-04
//  features   : 支持高清机顶盒和主流浏览器
//               支持分区块指定各自的焦点渲染事件;
//               支持自定义除"上下左右"四个方向按键之外的诸如ok/确定，退出等其他按键事件。
//               支持自动计算定位下一个焦点接收目标，同时支持手动辅助指定，如后者存在，以后者优先。                      
//  version    : 1.0
//**********************************************************************
function loadMe(){
  (function(){
      var oSlideFocus = {
           //按键键值定义，可酌情添加
           keyConst : {
              KEY_LEFT     : 37,
  			      KEY_LEFT_STB : 3,
              KEY_RIGHT    : 39,
  			      KEY_RIGHT_STB: 4,
              KEY_UP       : 38,
  			      KEY_UP_STB   : 1,
              KEY_DOWN     : 40,
  			      KEY_DOWN_STB : 2,
              
              KEY_OK       : 13,
              KEY_BACK     : 45,
              KEY_QUIT     : 339,
              KEY_PAGEUP   : 372,
              KEY_PAGEDOWN : 373                      
           },
           
           //选项
           options : {
               keyHandlers:{},
               focusHandlers:{}
           },
           
           //默认值
           defaults : {
              targetAttrName : "title",
              defaultFocusedId : null
           },
           
           //entrance
           focus : function (_options) {
             this._init(_options);
           },
           
           //设置按键事件函数
           setKeyDownHandler : function(keyCode, evt) {
              if (typeof keyCode != "number") {
                 alert("指定了无效的键值码：" + keyCode);
                 return;
              }
              
              if (evt && (typeof evt != "function")) {
                 alert("指定的按键处理函数无效！");
                 return;
              }
              
              this.options.keyHandlers['keyCode_'+keyCode] = evt;
           },
           
           //设置统一的焦点渲染效果事件
           setFocusHandler : function(evt) {
              if (evt && (typeof evt != "function")) {
                 alert("指定的焦点UI渲染函数无效！");
                 return;
              }
              
              this.options.focusHandlers['evtFocusOrNot'] = evt;         
           }, 
           
           _getKeyDownHandler : function(keyCode) {
              return this.options.keyHandlers['keyCode_'+keyCode];
           },
           
           _getFocusHandler : function() {
              return this.options.focusHandlers['evtFocusOrNot'];
           },
  
           _getCusomizedValueBy : function(currDOM, attrName) {
        			 var result = null;
        			 if (currDOM && attrName){
                 var sValue = currDOM.getAttribute(this.options.targetAttrName) || currDOM[this.options.targetAttrName];				 
        				 if (sValue){
        					 var oDOMAttr = eval("("+sValue+")");
        					 if (oDOMAttr){
        						 result = oDOMAttr[attrName];
        					 }
        				 }
        			 }
        			 return result;
	         },
           
           _getDOMFocusHandler : function(currDOM) {
              var funcFocusUI = null;
              if (currDOM) {
                  var p = null;
                  var attrName = "focusUI";
                  var funcFocusUI = this._getCusomizedValueBy(currDOM, attrName);
                  if (!funcFocusUI) {               
                     p = currDOM.offsetParent;
                     while(p) {
                         funcFocusUI = this._getCusomizedValueBy(p, attrName);
                         if (funcFocusUI) {
                            break;
                         }
                         
                         p = p.offsetParent;
                     }
                  }            
              }            
              return funcFocusUI;
           },         
           
           _extend : function (target, src) {
             for (var a in src) {
                target[a] = src[a];
             }
             return target;
           },        
           
           _init : function(_options){
              this.focusableMaps = [];
              this._extend(this.options, this.defaults);
              this._extend(this.options, _options);             
              var attr = null;
          		var eles = document.body.getElementsByTagName("*");
         		    for(var i = 0; i < eles.length; i++) {
            			attrValue = this._getCusomizedValueBy(eles[i], "focusable");
            			if(attrValue) {
      					      this.focusableMaps.push(eles[i]);
            			}
      			    }
      			 
      			  if (this.focusableMaps.length > 0) {
   			         if (this.options.defaultFocusedId) {
   			            this._focusedElements.current = this._getFocusableById(this.options.defaultFocusedId);
                 }
                 if (!this._focusedElements.current) {
                    this._focusedElements.current = this._getMostLeftTopFocusable();
                 }
      				   this._moveAndFocus();
              }		      
      			      
      			  this._initDefaultKeyHandlers(_options);
      			  document.onkeydown = oHandleKeyEvent;
          },
          
          _moveAndFocus : function() {
              var oFunc = this._getDOMFocusHandler(this._focusedElements.last) || this._getFocusHandler();
              if (oFunc && (oFunc=eval(oFunc))) {
                 if (this._focusedElements.last) {
                    try {
                       oFunc(this._focusedElements.last, false);
                    } catch(e){
                    }                    
                 }             
              }
               
              oFunc = this._getDOMFocusHandler(this._focusedElements.current) || this._getFocusHandler(); 
              if (oFunc && (oFunc=eval(oFunc))) {
                  if (this._focusedElements.current) {
                     try{
                       oFunc(this._focusedElements.current, true);
                     }catch(e){
                     }                        
                  }              
              }      
          },
          
          _switchCurrentAndLast : function (oCurrent) {
              this._focusedElements.last = this._focusedElements.current;
              this._focusedElements.current = oCurrent;           
          },
          
          _getFocusableById : function(sId) {
             var items = this.focusableMaps;
             if (items && items.length > 0) {
                for (var i in items) {
                  if (items[i].id == sId) {
                     return items[i];
                  }
                }
             }
             
             return null;
          },
          
          _getMostLeftTopFocusable : function() {
             var items = this.focusableMaps;
             if (items && items.length > 0) {              
                var oItemLeft = items[0];
                var oItemLeftPos = this._pos(oItemLeft);
                var oTempPos = null;
                
                for (var i = 1; i < items.length; i++) {
                   oTempPos = this._pos(items[i]);
                   if (oTempPos.left < oItemLeftPos.left) {
                      oItemLeft = items[i];
                      oItemLeftPos = this._pos(oItemLeft);
                   }
                }
                
                var oItemTop = items[0];
                var oItemTopPos = this._pos(oItemTop);              
                for (var i = 1; i < items.length; i++) {
                   oTempPos = this._pos(items[i]);
                   if (oTempPos.top < oItemTopPos.top) {
                      oItemTop = items[i];
                      oItemTopPos = this._pos(oItemTop);
                   }
                }
                
                
                if (oItemLeftPos.top <= oItemTopPos.top) {
                  return oItemLeft;
                } else if (oItemTopPos.left <= oItemLeftPos.left) {
                  return oItemTop;
                }
                
                return oItemLeft; 
             }
             
             return null;
          },
          
          _focusedElements : {
            current : null,
            last    : null
          },
          
          _initDefaultKeyHandlers : function(_options) {
             this.setKeyDownHandler(this.keyConst.KEY_LEFT, this._moveLeft);
      		   this.setKeyDownHandler(this.keyConst.KEY_LEFT_STB, this._moveLeft);
             this.setKeyDownHandler(this.keyConst.KEY_RIGHT, this._moveRight);
      		   this.setKeyDownHandler(this.keyConst.KEY_RIGHT_STB, this._moveRight);
             this.setKeyDownHandler(this.keyConst.KEY_UP, this._moveUp);
      		   this.setKeyDownHandler(this.keyConst.KEY_UP_STB, this._moveUp);
             this.setKeyDownHandler(this.keyConst.KEY_DOWN, this._moveDown);
      		   this.setKeyDownHandler(this.keyConst.KEY_DOWN_STB, this._moveDown);
          },
          
          _goToSpecifiedNext : function(nextDirection) {
             if (nextDirection != null && this._focusedElements.current != null) {
                var nextId = this._getCusomizedValueBy(this._focusedElements.current, nextDirection);
                if (nextId == "" || nextId == "null") {
                   return true;
                } 
                
                if (nextId) {
                   var nextDOM = this._getFocusableById(nextId);
                   if (nextDOM) {
            		      this._switchCurrentAndLast(nextDOM);
            		      this._moveAndFocus();
                      return true;                 
                   }             
                }           
             }            
             return false;          
          },
          
          _moveLeft : function (evt, oCurr, oThis) {
              //指定优先
              if (oThis._goToSpecifiedNext("nextLeft")) {
                 return 0;
              }
          
        			var leftSet = [];
       				var currentPos = oThis._pos(oThis._focusedElements.current);
        			for(var i in oThis.focusableMaps) {
        				var item = oThis.focusableMaps[i], left = oThis._pos(item).left;
        				if(left < currentPos.left) {
        					leftSet.push(item);
        				}
        			}
        			if(leftSet.length > 0) {
        				var minDist = Math.abs(currentPos.midVertical - oThis._pos(leftSet[0]).midVertical);
        				for(var i in leftSet) {
        					var item = leftSet[i], dist = Math.abs(currentPos.midVertical - oThis._pos(item).midVertical);
        					if(dist < minDist) {
        						minDist = dist;
        					}
        				}
        				var closest = [];
        				for(var i in leftSet) {
        					var item = leftSet[i], dist = Math.abs(currentPos.midVertical - oThis._pos(item).midVertical);
        					if(dist == minDist) {
        						closest.push(item);
        					}
        				}
        				var closed = closest[0], tempLeft = oThis._pos(closed).midHorizontal;
        				for(var i in closest) {
        					var item = closest[i], left = oThis._pos(item).midHorizontal;
        					if(left > tempLeft) {
        						closed = item;
        					}
        					tempLeft = left;
        				}
          		  oThis._switchCurrentAndLast(closed);
          		  oThis._moveAndFocus();
        			}
          },
          
          _moveRight : function (evt, oCurr, oThis) {
              //指定优先
              if (oThis._goToSpecifiedNext("nextRight")) {
                 return 0;
              }
                      
          		var rightSet = [];
          		var currentPos = oThis._pos(oThis._focusedElements.current);
          		
          		for(var i in oThis.focusableMaps) {
          			var item = oThis.focusableMaps[i], 
                    right = oThis._pos(item).left;
          			if(right > currentPos.left) {
          				rightSet.push(item);
          			}
          		}
          		
          		if(rightSet.length > 0) {        		
          			var minDist = Math.abs(currentPos.midVertical - oThis._pos(rightSet[0]).midVertical);
          			for(var i in rightSet) {
          				var item = rightSet[i], dist = Math.abs(currentPos.midVertical - oThis._pos(item).midVertical);
          				if(dist < minDist) {
          					minDist = dist;
          				}
          			}
          			
          			var closest = [];
          			for(var i in rightSet) {
          				var item = rightSet[i], dist = Math.abs(currentPos.midVertical - oThis._pos(item).midVertical);
          				if(dist == minDist) {
          					closest.push(item);
          				}
          			}
          			
          			var closed = closest[0], tempLeft = oThis._pos(closed).midHorizontal;
          			for(var i in closest) {
          				var item = closest[i], left = oThis._pos(item).midHorizontal;
          				if(left < tempLeft) {
          					closed = item;
          				}
          				tempLeft = left;
          			}
          			
          		  oThis._switchCurrentAndLast(closed);
          		  oThis._moveAndFocus();
          		}
          },  
          
          _moveUp : function (evt, oCurr, oThis) {
              //指定优先
              if (oThis._goToSpecifiedNext("nextUp")) {
                 return 0;
              }        
          
        			var topSet = [];
        			var currentPos = oThis._pos(oThis._focusedElements.current);
        			for(var i in oThis.focusableMaps) {
        				var item = oThis.focusableMaps[i], top = oThis._pos(item).top;
        				if(top < currentPos.top) {
        					topSet.push(item);
        				}
        			}
        			if(topSet.length > 0) {
   			        var tempY = 0;
   			        var minY = Math.abs(currentPos.midVertical - oThis._pos(topSet[0]).midVertical);
   			        var minClosed = topSet[0];
    			      for (var i = 1; i < topSet.length; i++) {
      			        tempY = Math.abs(currentPos.midVertical - oThis._pos(topSet[i]).midVertical);
      			        if (tempY < minY) {
      			           minY = tempY;
      			           minClosed = topSet[i];
                    }
                }
                
                var minClosedSet = [];
     			      for (var i = 0; i < topSet.length; i++) {
      			        if (Math.abs(currentPos.midVertical - oThis._pos(topSet[i]).midVertical) == minY) {
      			           minClosedSet.push(topSet[i]);
                    }
                }
                
                var tempX = 0;
                minClosed = minClosedSet[0];
                var minX = Math.abs(oThis._pos(minClosedSet[0]).midHorizontal - currentPos.midHorizontal);                 
                for (var i = 1; i < minClosedSet.length; i++) {
                    tempX = Math.abs(oThis._pos(minClosedSet[i]).midHorizontal - currentPos.midHorizontal);
                    if (tempX < minX) {
                       minX = tempX;
                       minClosed = minClosedSet[i];
                    }
                }
                                                
       		      oThis._switchCurrentAndLast(minClosed);
     		        oThis._moveAndFocus();
        			}
          },
          
          _moveDown : function (evt, oCurr, oThis) {
              //指定优先
              if (oThis._goToSpecifiedNext("nextDown")) {
                 return 0;
              }        
          
        			var bottomSet = [];
        			var currentPos = oThis._pos(oThis._focusedElements.current);
        			for(var i in oThis.focusableMaps) {
        				var item = oThis.focusableMaps[i], top = oThis._pos(item).top;
        				if(top > currentPos.top) {
        					bottomSet.push(item);
        				}
        			}
        			if(bottomSet.length > 0) {
      			     var tempY = 0;
      			     var minClosed = bottomSet[0];
      			     var minY = Math.abs(oThis._pos(bottomSet[0]).midVertical - currentPos.midVertical);
      			     for (var i = 1; i < bottomSet.length; i++) {
      			        tempY = Math.abs(oThis._pos(bottomSet[i]).midVertical - currentPos.midVertical);
      			        if (tempY < minY) {
      			           minY = tempY;
      			           minClosed = bottomSet[i];
                    }
                 }
                 
                 var minClosedSet = [];
      			     for (var i = 0; i < bottomSet.length; i++) {
      			        if (Math.abs(oThis._pos(bottomSet[i]).midVertical - currentPos.midVertical) == minY) {
      			           minClosedSet.push(bottomSet[i]);
                    }
                 }
                 
                 
                 var tempX = 0;
                 minClosed = minClosedSet[0];
                 var minX = Math.abs(oThis._pos(minClosedSet[0]).midHorizontal - currentPos.midHorizontal);                 
                 for (var i = 1; i < minClosedSet.length; i++) {
                    tempX = Math.abs(oThis._pos(minClosedSet[i]).midHorizontal - currentPos.midHorizontal);
                    if (tempX < minX) {
                       minX = tempX;
                       minClosed = minClosedSet[i];
                    }
                 }
                 
         		     oThis._switchCurrentAndLast(minClosed);
      		       oThis._moveAndFocus(); 
        			}
          },                      
           
          _pos : function (obj) {
             var result = {top:0, left:0, width:0, height:0, midHorizontal:0, midVertical:0};
             if (obj) {
                 var w = obj.offsetWidth, h = obj.offsetHeight;  
                 
                 var t = obj.offsetTop; l=obj.offsetLeft;
                 for (; obj = obj.offsetParent;obj != null) {  
                      t += obj.offsetTop;  
                      l += obj.offsetLeft;  
                 }
              
                 result.top = t;
                 result.left = l;
                 result.width = w;
                 result.height = h; 
                 result.midHorizontal = result.left + Math.round(result.width / 2.0); 
                 result.midVertical = result.top + Math.round(result.height / 2.0);
             }
             
             return result;
          }
      }
       
      var oHandleKeyEvent = function(evt) {
          var result = 1;
    		  var keyCode = !!window.event ? window.event.keyCode : evt.which;
          var oHandler = oSlideFocus._getKeyDownHandler(keyCode);
          if (oHandler && (typeof oHandler == "function")) {
             if (oSlideFocus._focusedElements.current) {
                try{
                  oHandler(evt, oSlideFocus._focusedElements.current, oSlideFocus);
                  result = 0;
                }catch(e){
                  result = -1;
                }  			        
             }           
          }
  
  		    return result;
      }
  
      window.getAutoFocusHelper = function() {
         return oSlideFocus
      };
    
  })(window);
  
  return window.getAutoFocusHelper();
}
