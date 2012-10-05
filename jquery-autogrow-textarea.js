;(function($, doc) {
    'use strict';

    // Plugin interface
    $.fn.autoGrowTextarea = autoGrowTextArea;
    $.fn.autoGrowTextArea = autoGrowTextArea;

    // Shorthand alias
    if (!('autoGrow' in $.fn)) {
        $.fn.autoGrow = autoGrowTextArea;
    }

    /**
     * Initialization on each element
     */
    function autoGrowTextArea() {
        return this.each(init);
    }

    /**
     * Actual initialization
     */
    function init() {
        var $this, $textarea, $origin, origin, hasOffset, innerHeight, height, offset = 0;

        var $this = $(this);
        if($this.is('input')) {
            var attributes = {};
            
            // remove all attributes that are valid for inputs but not textareas
            $this.removeAttr('accept alt autocomplete checked formaction formenctype formmethod formnovalidate formtarget height list max min multiple pattern size src step width');

            // loop over the remaining attributes and write them into an object
            $.each($this[0].attributes, function(index, attr) {
                // due to a jquery bug the type attribute can't be changed/removed, so we are filtering it out here
                if(attr.name !== 'type') {
                    attributes[attr.name] = attr.value;
                }
            });
            
            // then apply the attributes to a newly created textarea, insert it before the input and remove the latter
            var $textarea = $('<textarea></textarea>').insertAfter($this).attr(attributes).data('expanding-input', attributes);
            $this.remove();

            $this = $textarea;
        }
        
        $textarea = $this.css({overflow: 'hidden', resize: 'none'});
        $origin = $textarea.clone().val('').appendTo(doc.body);
        origin = $origin.get(0);

        height = $origin.height();
        origin.scrollHeight; // necessary for IE6-8. @see http://bit.ly/LRl3gf
        hasOffset = (origin.scrollHeight !== height);

        // `hasOffset` detects whether `.scrollHeight` includes padding.
        // This behavior differs between browsers.
        if (hasOffset) {
            innerHeight = $origin.innerHeight();
            offset = innerHeight - height;
        }

        $origin.hide();

        $textarea
            .data('autogrow-origin', $origin)
            .data('autogrow-offset', offset)
            .data('autogrow-initial-height', height)
            .on('focus', onTextAreaFocus)
            .on('blur', onTextAreaBlur)
            ;

        grow($textarea, $origin, origin,  height, offset);
    }

    /**
     * on focus
     */
    function onTextAreaFocus() {
        var $textarea, $origin, origin, initialHeight, offset, doGrow, timerId;

        $textarea = $(this);
        $origin = $textarea.data('autogrow-origin');
        origin = $origin.get(0);
        initialHeight = $textarea.data('autogrow-initial-height');
        offset = $textarea.data('autogrow-offset');
        grow.prev = $textarea.attr('value');
        doGrow = function() {
            grow($textarea, $origin, origin, initialHeight, offset);
        };

        timerId = setInterval(doGrow, 10);
        $textarea.data('autoGrowTimerId', timerId);
    }

    /**
     * on blur
     */
    function onTextAreaBlur() {
        var timerId = $(this).data('autoGrowTimerId');
        clearInterval(timerId);
    }

    /**
     * grow textarea height if its value changed
     */
    function grow($textarea, $origin, origin, initialHeight, offset) {
        var current, prev, scrollHeight, height;

        current = $textarea.attr('value');
        prev = grow.prev;
        if (current === prev) return;

        grow.prev = current;

        $origin.attr('value', current).show();
        origin.scrollHeight; // necessary for IE6-8. @see http://bit.ly/LRl3gf
        scrollHeight = origin.scrollHeight;
        height = scrollHeight - offset;
        $origin.hide();

        $textarea.height(height > initialHeight ? height : initialHeight);
    }
}(jQuery, document));
