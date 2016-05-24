(function (root, factory) {
    'use strict';
    if (typeof module === 'object') {
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.CircleChart = factory;
    }
}(this, function () {
    
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

var CircleChart = function (opts) {
    var me = this, $chart, $tooltip, $container = opts.$container,
            size = opts.size || $container.offsetWidth,
            centerOfTheCircle = size / 2,
            staticTotal = !isDefined(opts.staticTotal) ? false : opts.staticTotal,
            total = staticTotal ? opts.total || 0 : 0, totalPercent = 0,
            ringProportion = opts.ringProportion || 0.35,
            speed = opts.speed || 1,
            durration = opts.durration || 10,
            PI = Math.PI,
            cos = Math.cos,
            sin = Math.sin,
            animated = !isDefined(opts.animated) ? true : opts.animated,
            drawAtStart = !isDefined(opts.drawAtStart) ? true : opts.drawAtStart,
            shouldAddTooltip = isDefined(opts.tooltips) ? !!opts.tooltips : false,
            addPiePathsAtLast = !isDefined(opts.tooltips) ? false : opts.addPiePathsAtLast;

    createChart();
    createBackgroundRing();
    if (addPiePathsAtLast) {
        createEmptyBackgroundRing();
        addPaths();
    } else {
        addPaths();
        createEmptyBackgroundRing();
    }
    if (shouldAddTooltip) {
        createTooltipContainer();
    }
    opts.$container.appendChild($chart);
    executeEvent('onAfterRender');
    if (drawAtStart) {
        drawPaths();
    }

    me.update = function (data) {
        loopOverSectors(function (sector) {
            setNewSectorValue(sector, data[sector.name]);
            removePathPie(sector.$path);
        });
        drawPaths();
    };

    me.setTotal = function (newTotal) {
        total = Number(newTotal);
    };

    function drawPaths() {
        calculateTotal();
        calculatePercents();
        executeEvent('onUpdateStart');
        if (animated === true) {
            drawWithAnimation();
        } else {
            draw();
            executeEvent('onUpdateEnd');
        }
    }

    function drawWithAnimation() {
        var startAngle = -PI / 2, endAngle = 0,
                sectors = opts.definition,
                length = sectors.length,
                counter = 0;
        anim(startAngle, length, counter);
    }

    function anim(startAngle, length, counter) {
        var sector = opts.definition[counter], timeout, currentValue = 0, newStartAngle = 0,
                timeoutFn = function () {
                    if (shouldDrawSection(sector)) {
                        currentValue += getSectorNextAnimValue(sector, currentValue);
                        newStartAngle = updatePath(sector.$path, startAngle, currentValue);
                    }
                    if (currentValue < sector.percent) {
                        timeout = setTimeout(timeoutFn, durration);
                    } else if (counter < length - 1) {
                        counter += 1;
                        newStartAngle += startAngle;
                        currentValue = 0;
                        anim(newStartAngle, length, counter);
                    } else {
                        executeEvent('onUpdateEnd');
                    }
                };
        timeout = setTimeout(timeoutFn, durration);
    }

    function draw() {
        var startAngle = -PI / 2;
        loopOverSectors(function (sector) {
            if (shouldDrawSection(sector)) {
                startAngle += updatePath(sector.$path, startAngle, sector.percent);
            }
        });
    }

    function updatePath($path, startAngle, value) {
        var sectorAngle = (value / 100) * (PI * 2),
                endRadius = startAngle + sectorAngle,
                largeArc = ((endRadius - startAngle) % (PI * 2)) > PI ? 1 : 0, //inversion
                startX = centerOfTheCircle + cos(startAngle) * centerOfTheCircle,
                startY = centerOfTheCircle + sin(startAngle) * centerOfTheCircle,
                endX = centerOfTheCircle + cos(endRadius) * centerOfTheCircle,
                endY = centerOfTheCircle + sin(endRadius) * centerOfTheCircle,
                d = [
                    'M', startX, startY,
                    'A', centerOfTheCircle, centerOfTheCircle, 0, largeArc, 1, endX, endY,
                    'L', centerOfTheCircle, centerOfTheCircle,
                    'Z'
                ];
        $path.setAttribute("d", d.join(' '));
        return sectorAngle;
    }

    function calculateTotal() {
        if (staticTotal === true) {
            return;
        }
        total = 0;
        loopOverSectors(function (sector) {
            sector.value = Number(sector.value || 0);
            total += sector.value;
        });
    }

    function  calculatePercents() {
        totalPercent = 0;
        if (total === 0) {
            return;
        }
        loopOverSectors(function (sector, index) {
            sector.percent = Math.round(100 * sector.value / total);
            totalPercent += sector.percent;
            if (isLastSector(index) && staticTotal === false) {
                sector.percent += 100 - totalPercent;
            }
        });
    }

    function addPaths() {
        loopOverSectors(addPath);
    }

    function addPath(sector) {
        var $path = createSvgElement('path');
        if (isDefined(sector.cls)) {
            $path.setAttributeNS(null, "class", sector.cls);
        }
        if (isDefined(sector.color) || shouldAddTooltip) {

            $path.setAttributeNS(null, "style",
                    (isDefined(sector.color) ? ('fill: ' + sector.color) + ';' : '') + ' ' +
                    (shouldAddTooltip === true ? 'cursor: pointer;' : '')
                    );
        }
        if (shouldAddTooltip) {
            $path.addEventListener('click', onPathhClick.bind(sector));
        }
        $chart.appendChild($path);
        sector.$path = $path;
    }

    function onPathhClick(event) {
        var sector = this, scrollPosition;
        if (shouldAddTooltip) {
            scrollPosition = getPageScrollPosition();
            $tooltip.textContent = sector.label + ' : ' + sector.value;
            $tooltip.style.left = (event.x + scrollPosition.left - $tooltip.offsetWidth / 2) + 'px';
            $tooltip.style.top = (event.y + scrollPosition.top - 20) + 'px';
            if (opts.tooltipClass) {
                $tooltip.classList.toggle('circle-chart-tooltip-is-visible');
            } else {
                $tooltip.style.visibility = 'visible';
                $tooltip.style.opacity = '1';
                $tooltip.style['z-index'] = 'auto';
                $tooltip.style.transition = 'visibility 0s .6s, z-index 0s .6s, opacity .6s ease;';
                $tooltip.style.position = 'absolute';
            }
        }
        executeEvent('onPathClick', event);
    }

    function hideToltip() {
        setHiddenTooltipStyles();
    }

    function loopOverSectors(fn) {
        var x = 0, definition = opts.definition,
                length = definition.length;
        for (; x < length; x += 1) {
            fn.call(me, definition[x], x);
        }
    }

    function createChart() {
        $chart = createSvgElement("svg:svg");
        $chart.setAttribute("width", size);
        $chart.setAttribute("height", size);
        $chart.setAttribute("viewBox", "0 0 " + size + " " + size);
    }

    function createBackgroundRing() {
        var $background = createCircle(centerOfTheCircle, centerOfTheCircle);
        if (isDefined(opts.background)) {
            $background.setAttributeNS(null, "style", "fill: " + opts.background);
        } else {
            $background.setAttributeNS(null, "class", "circle-chart-background");
        }
        $chart.appendChild($background);
    }

    function createEmptyBackgroundRing() {
        if (!!opts.isPie === false) {
            var $emptyCircle = createCircle(centerOfTheCircle, size * ringProportion);
            if (isDefined(opts.middleCircleColor)) {
                $emptyCircle.setAttributeNS(null, "style", "fill: " + opts.middleCircleColor);
            } else {
                $emptyCircle.setAttributeNS(null, "class", "circle-chart-background-empty");
            }
            $chart.appendChild($emptyCircle);
        }
    }

    function createTooltipContainer() {
        $tooltip = document.createElement("div");
        if (opts.tooltipClass) {
            $tooltip.className = opts.tooltipClass;
        }
        setHiddenTooltipStyles();
        $container.appendChild($tooltip);
        document.body.addEventListener('click', onOutOffContainerClick);
    }

    function setHiddenTooltipStyles() {
        $tooltip.style.cssText = 'position: fixed; visibility: hidden; ' +
                'opacity: 0; z-index: -1; color: #fff; ' +
                'padding: 10px; ' +
                'background-color: rgba(0,0,0,0.6); ' +
                'transition: opacity .6s ease;';
    }

    function createCircle(size, radius) {
        var circle = createSvgElement("circle");
        circle.setAttributeNS(null, "cx", size);
        circle.setAttributeNS(null, "cy", size);
        circle.setAttributeNS(null, "r", radius);
        return circle;
    }

    function createSvgElement(type) {
        return document.createElementNS(SVG_NAMESPACE, type);
    }

    function shouldDrawSection(section) {
        return section.value > 0 && section.percent > 0;
    }

    function isDefined(val) {
        return typeof val !== 'undefined';
    }

    function setNewSectorValue(sector, value) {
        if (isDefined(value)) {
            sector.value = parseInt(value);
        }
    }

    function  removePathPie($path) {
        $path.removeAttribute('d');
    }

    function isLastSector(index) {
        return index + 1 === opts.definition.length;
    }

    function getSectorNextAnimValue(sector, currentValue) {
        var percent = sector.percent, step = speed;
        if (currentValue + speed > percent) {
            step = percent - currentValue;
        }
        if (currentValue + step === 100) {
            step -= 0.0001;
        }
        return step;
    }

    function executeEvent(name, originalEvent) {
        var fn = opts[name];
        if (typeof fn === 'function') {
            fn.call(me, {
                $chart: $chart,
                chart: me,
                total: total,
                event: originalEvent,
                $tooltip: $tooltip
            });
        }
    }

    function onOutOffContainerClick(event) {
        var $target = event.target;
        if ($container.contains($target) === false) {
            hideToltip();
        }
    }

    function getPageScrollPosition() {
        var doc = document.documentElement;
        return {
            left: (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
            top: (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
        };
    }

};

    return CircleChart;
}()));