import { CoreUi } from '@sharedo/mobile-core'

export default {

    deferredPrompt: null,
    
    initialised: false,

    // Call this on mounted()
    init: function() {
        var self = this;

        if (self.initialised) return;
        self.initialised = true;

        window.addEventListener("beforeinstallprompt", e => {
            if (self.deferredPrompt) return;

            e.preventDefault();
            self.deferredPrompt = e;

            self.showBanner();
        });

        self.checkIos();
    },

    checkIos: function(comp) {
        var self = this;

          const isIos = /iphone|ipad|ipod/.test( window.navigator.userAgent.toLowerCase() );

          const isStandalone = ('standalone' in window.navigator) && (window.navigator.standalone);
          
          if (isIos && !isStandalone) {
            setTimeout(self.showIosBanner.bind(self), 500);
          }
    },

    showBanner: function() {
        var self = this;
        
        CoreUi.banner({
            message: "For the best experience, install this app on your phone.",
            multiline: true,
            color: "info",
            icon: "mdi-download",
            btns: [
                { text: "Dismiss", color: "grey" },
                { text: "Install", color: "primary", handler: function() { self.deferredPrompt.prompt(); } },
            ],
        })
    },

    showIosBanner: function() {
        
        CoreUi.banner({
            message: "For the best experience, tap icon at bottom of Safari, then \"Add to Home Screen\".",
            multiline: true,
            icon: "mdi-export-variant",
            btns: [
                { text: "Dismiss", color: "grey" },
            ],
        })
    },
};
