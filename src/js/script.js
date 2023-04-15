
jQuery(function ($) { // この中であればWordpressでも「$」が使用可能になる
  //メインビューのスライダー実装内容
    var swiper = new Swiper(".js-mv-swiper", {
      effect: "fade",
      loop: true,
      speed: 1000,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false
      }
    });
  //制作実績のスライダー実装内容
    var swiper = new Swiper(".js-works-swiper", {
      loop: true,
      speed: 1000,
      pagination: {
        el: ".js-works-pagination",
        clickable: true
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false
      },
    });

});
