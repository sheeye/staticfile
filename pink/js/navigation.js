document.ready(function() {
  const componentNavigation = new Vue({
    el: '#navigation',
    data: {
      autoParam: {
        exist: $('#autoload') ? true : false,
        index: 0,
        indexDef: $('#autoload') ? Number($('#autoload').getAttribute('data-indexdefault')) : 0,
        indexMax: $('#autoload') ? Number($('#autoload').getAttribute('data-totalpages')) : 0,
        navApi: $('#autoload') ? $('#autoload').getAttribute('data-api') : '',
        isLast: undefined,
        ajaxLock: false,
        ajaxDelay: siteParams.ajaxDelay,
        scrollTopBefore: 0,
        elements: {
          posts: $('#posts')
        }
      },
      autoStatusText: {
        normaltxt: $('#autoload') ? $('#autoload').getAttribute('data-normaltxt') : '',
        waittxt: $('#autoload') ? $('#autoload').getAttribute('data-waittxt') : '',
        lasttxt: $('#autoload') ? $('#autoload').getAttribute('data-lasttxt') : '',
        output: ''
      },
      autoWaitBool: false
    },
    methods: {
      targetSelf: function(target) {
        link(target, 'self');
      },
      autoStatus: function(s) {
        switch (s) {
          case 'last':
            this.autoParam.isLast = true;
            this.autoWaitBool = false;
            this.autoStatusText.output = this.autoStatusText.lasttxt;
            break;
          case 'wait':
            this.autoWaitBool = true;
            this.autoStatusText.output = this.autoStatusText.waittxt;
            break;
          case 'normal':
            this.autoParam.isLast = false;
            this.autoWaitBool = false;
            this.autoStatusText.output = this.autoStatusText.normaltxt;
            break;
        }
      },
      autoHandleClick: function() {
        if (!this.autoParam.isLast) this.autoAjaxRequest();
      },
      autoHandleScroll: function() {
        if (!this.autoParam.isLast) {
          let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
          let windowHeight = document.documentElement.clientHeight;
          if (scrollTop > this.autoParam.scrollTopBefore && scrollTop + windowHeight > this.$el.offsetTop) this.autoAjaxRequest();
          this.autoParam.scrollTopBefore = scrollTop;
        }
      },
      autoAjaxRequest: function() {
        if (!this.autoParam.ajaxLock) {
          this.autoParam.ajaxLock = true;
          this.autoStatus('wait');
          setTimeout(() => {
            this.autoParam.index++;
            let url = this.autoParam.navApi.tplRender({
              index: this.autoParam.index
            });
            let data = new FormData();
            data.append('nav', 'auto');
            axios.post(url, data, {
              headers: {
                'Content-Type': 'application/x-www-urlencoded'
              }
            }).then(res => {
              this.autoParam.elements.posts.insertAdjacentHTML('beforeend', res.data);
              this.autoStatus(this.autoParam.index < this.autoParam.indexMax ? 'normal' : 'last');
              this.autoParam.ajaxLock = false;
            }).catch(err => {
              log('nav error: ' + err.message);
              this.autoParam.ajaxLock = false;
            });
          }, this.autoParam.ajaxDelay);
        }
      }
    },
    mounted: function() {
      if (this.autoParam.exist) {
        if (this.autoParam.indexDef < this.autoParam.indexMax) {
          this.autoParam.index = this.autoParam.indexDef;
          window.addEventListener('scroll', this.autoHandleScroll);
          this.autoStatus('normal');
        } else {
          this.autoStatus('last');
        }
      }
    }
  });
});