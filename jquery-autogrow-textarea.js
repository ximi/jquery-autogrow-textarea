;(function($, doc) {
    'use strict';

    $.autoGrowTextArea = function(textarea, options) {
        // let's set up plugin wide variables
        var defaults = {
            
        },
            plugin = this,
            $textarea = $(textarea),
            origin;
        
        plugin.settings = {};

        /**
         * Private init function that is called only once, when autoGrowTextarea is called
         */
        var init = function() {
            // initiate our settings, use defaults where necessary
            plugin.settings = $.extend({}, defaults, options);
            
            plugin.offset = 0;
            
            plugin.reinit();
        };
        
        /**
         * Enables the plugin
         */
        plugin.enable = function() {
            $textarea.on({
                'focus.autoGrowTextArea': onTextAreaFocus,
                'blur.autoGrowTextArea': onTextAreaBlur
            });
            
            // match the clone value with the original and run an initial grow
            plugin.$origin.val($textarea.val());
            plugin.grow();
        };
        
        /**
         * Disables the plugin
         */
        plugin.disable = function() {
            $textarea.off('.autoGrowTextArea');
            
            // clear the interval in case it was still running
            clearInterval(plugin.timerId);
        };
        
        /**
         *  Reinitialize the plugin
         */
        plugin.reinit = function() {
            // disable the plugin while reinitializing
            plugin.disable();
            
            $textarea.css({overflow: 'hidden', resize: 'none'});
            
            // check if $origin already exists and remove it if so
            if(plugin.$origin) {
                plugin.$origin.remove();
            }
            
            plugin.$origin = $textarea.clone().val('').appendTo(doc.body);
            origin = plugin.$origin.get(0);

            plugin.height = plugin.$origin.height();
            origin.scrollHeight; // necessary for IE6-8. @see http://bit.ly/LRl3gf
            plugin.hasOffset = (origin.scrollHeight !== plugin.height);

            // `hasOffset` detects whether `.scrollHeight` includes padding.
            // This behavior differs between browsers.
            if (plugin.hasOffset) {
                plugin.innerHeight = plugin.$origin.innerHeight();
                plugin.offset = plugin.innerHeight - plugin.height;
            }
            
            plugin.initialHeight = plugin.height;

            plugin.$origin.hide();
            
            // we are done reinitializing, let's enable the plugin
            plugin.enable();
        };
        
        /**
         * grow textarea height if its value changed
         */
        plugin.grow = function() {
            var current, scrollHeight, height;

            current = $textarea.attr('value');
            if (current === plugin.prev) return;

            plugin.prev = current;

            plugin.$origin.attr('value', current).show();
            origin.scrollHeight; // necessary for IE6-8. @see http://bit.ly/LRl3gf
            scrollHeight = origin.scrollHeight;
            height = scrollHeight - plugin.offset;
            plugin.$origin.hide();

            $textarea.height(height > plugin.initialHeight ? height : plugin.initialHeight);
        };

        /**
         * on focus
         */
        var onTextAreaFocus = function() {
            plugin.prev = $textarea.val();
            plugin.timerId = setInterval(plugin.grow, 30);
        };

        /**
         * on blur
         */
        var onTextAreaBlur = function() {
            clearInterval(plugin.timerId);
        };

        /**
         * destroy the plugin and remove all traces of it
         */
        plugin.destory = function() {
            plugin.disable();
            plugin.$origin.remove();
            
            $textarea.removeData('autoGrowTextArea');
        };
        
        init();
    };

    /**
     * Initialization on each element
     */
    var autoGrowTextArea = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('autoGrowTextArea')) {
                var plugin = new $.autoGrowTextArea(this, options);
                $(this).data('autoGrowTextArea', plugin);
            }
        });
    };
    
    // Plugin interface
    $.fn.autoGrowTextarea = autoGrowTextArea;
    $.fn.autoGrowTextArea = autoGrowTextArea;
    
    // Shorthand alias
    if (!('autoGrow' in $.fn)) {
        $.fn.autoGrow = autoGrowTextArea;
    }
}(jQuery, document));