/*##############*/
function getViewport() {
//Find out more about this function here
// http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/ 
   var viewPortWidth;
   var viewPortHeight;
   if (typeof window.innerWidth != 'undefined') {
     viewPortWidth = window.innerWidth,
     viewPortHeight = window.innerHeight
   }
   else if (typeof document.documentElement != 'undefined'
   && typeof document.documentElement.clientWidth !=
   'undefined' && document.documentElement.clientWidth != 0) {
      viewPortWidth = document.documentElement.clientWidth,
      viewPortHeight = document.documentElement.clientHeight
   }
   else {
     viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
     viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
   }
   return {width:viewPortWidth, height:viewPortHeight};
};

function getRect(el) {
//Find our more about this function here
//https://www.kirupa.com/html5/get_element_position_using_javascript.htm
  var _top = 0;var _left = 0;var _bottom = 0;var _right = 0;var rect = null;
  if(rect=el.getBoundingClientRect()){return rect;}else{
    while(el){
      if (el.tagName == "BODY") {
        var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        var yScroll = el.scrollTop || document.documentElement.scrollTop;     
        _left += (el.offsetLeft - xScroll + el.clientLeft);
        _top += (el.offsetTop - yScroll + el.clientTop);
      }else{
        _left += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        _top += (el.offsetTop - el.scrollTop + el.clientTop);
        _bottom = el.offsetHeight+_top;
        _right = el.offsetWidth+_left;
      }
      //el = el.offsetParent;
    }
    return {top: _top,left: _left,bottom: _bottom,right: _right,width:_left - _right,height:_top - _bottom};
  }
  return null;
};

function setBodyPaddingRelViewPort(){
  Body = document.querySelector("body");
  ViewPort = getViewport();
  Padding=(ViewPort.height*.5);
  Body.style.paddingBottom = Padding+"px";
}






