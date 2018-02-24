import {
    event as d3_event,
    select as d3_select
} from 'd3-selection';

import marked from 'marked';
import { t, textDirection } from '../util/locale';
import { svgIcon } from '../svg';


// This currently only works with the 'restrictions' field
var fieldHelpKeys = {
    restrictions: [
        ['inspecting',[
            'title',
            'about',
            'shadow',
            'from',
            'allow',
            'restrict',
            'only'
        ]],
        ['modifying',[
            'title',
            'about',
            'indicators',
            'indicators2',
            'allow',
            'restrict',
            'only'
        ]],
        ['tips',[
            'title',
            'tip1',
            'tip2',
            'tip3',
            'tip4',
            'tip5'
        ]]
    ]
};

var fieldHelpHeadings = {
    'help.field.restrictions.inspecting.title': 3,
    'help.field.restrictions.modifying.title': 3,
    'help.field.restrictions.tips.title': 3
};

var replacements = {};


export function uiFieldHelp(fieldName) {
    var fieldHelp = {};
    var _body = d3_select(null);
    var _showing;


    // For each section, squash all the texts into a single markdown document
    var docs = fieldHelpKeys[fieldName].map(function(key) {
        var helpkey = 'help.field.' + fieldName + '.' + key[0];
        var text = key[1].reduce(function(all, part) {
            var subkey = helpkey + '.' + part;
            var depth = fieldHelpHeadings[subkey];                     // is this subkey a heading?
            var hhh = depth ? Array(depth + 1).join('#') + ' ' : '';   // if so, prepend with some ##'s
            return all + hhh + t(subkey, replacements) + '\n\n';
        }, '');

        return {
            title: t(helpkey + '.title'),
            html: marked(text.trim())
        };
    });


    function show() {
        _body
            .classed('hide', false)
            .transition()
            .duration(200)
            .style('height', '100%');

        _showing = true;
    }


    function hide() {
        _body
            .transition()
            .duration(200)
            .style('height', '0px')
            .on('end', function () {
                _body.classed('hide', true);
            });

        _showing = false;
    }


    function clickHelp(d, i) {
        var rtl = (textDirection === 'rtl');

        _body.selectAll('.field-help-content').html(d.html);
        var nav = _body.selectAll('.field-help-nav').html('');

        if (rtl) {
            nav.call(drawNext).call(drawPrevious);
        } else {
            nav.call(drawPrevious).call(drawNext);
        }

        function drawNext(selection) {
            if (i < docs.length - 1) {
                var nextLink = selection
                    .append('a')
                    .attr('class', 'next')
                    .on('click', function() {
                        clickHelp(docs[i + 1], i + 1);
                    });

                nextLink
                    .append('span')
                    .text(docs[i + 1].title)
                    .call(svgIcon((rtl ? '#icon-backward' : '#icon-forward'), 'inline'));
            }
        }


        function drawPrevious(selection) {
            if (i > 0) {
                var prevLink = selection
                    .append('a')
                    .attr('class', 'previous')
                    .on('click', function() {
                        clickHelp(docs[i - 1], i - 1);
                    });

                prevLink
                    .call(svgIcon((rtl ? '#icon-forward' : '#icon-backward'), 'inline'))
                    .append('span')
                    .text(docs[i - 1].title);
            }
        }
    }


    fieldHelp.button = function(selection) {
        var button = selection.selectAll('.field-help-button')
            .data([0]);

        // enter/update
        button.enter()
            .append('button')
            .attr('class', 'field-help-button')
            .attr('tabindex', -1)
            .call(svgIcon('#icon-help'))
            .merge(button)
            .on('click', function () {
                d3_event.stopPropagation();
                d3_event.preventDefault();
                if (_showing) {
                    hide();
                } else {
                    show();
                }
            });
    };


    fieldHelp.body = function(selection) {
        // this control expects the field to have a preset-input-wrap div
        var wrap = selection.selectAll('.preset-input-wrap');
        if (wrap.empty()) return;

        _body = wrap.selectAll('.field-help-body')
            .data([0]);

        var enter = _body.enter()
            .append('div')
            .attr('class', 'field-help-body cf hide')
            .style('height', '0px');

        enter
            .append('h2')
            .text(t('help.field.' + fieldName + '.title'));

        enter
            .append('div')
            .attr('class', 'field-help-content');

        enter
            .append('div')
            .attr('class', 'field-help-nav');

        _body = _body
            .merge(enter);

        clickHelp(docs[0], 0);

        if (_showing === false) {
            hide();
        }
    };


    fieldHelp.showing = function(_) {
        if (!arguments.length) return _showing;
        _showing = _;
        return fieldHelp;
    };


    return fieldHelp;
}
