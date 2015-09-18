(function () {

    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var PieChart = function (opts) {
        var me = this, $chart,
                size = opts.size || opts.$container.offsetWidth,
                centerOfTheCircle = size / 2,
                total = 0,
                ringProportion = opts.ringProportion || 0.35,
                speed = opts.speed || 1,
                PI = Math.PI,
                cos = Math.cos,
                sin = Math.sin,
                animated = !isDefined(opts.animated) ? true : opts.animated,
                drawAtStart = !isDefined(opts.drawAtStart) ? true : opts.drawAtStart;

        createChart();
        createBacgroundRing();
        addPaths();
        if (drawAtStart) {
            drawPaths();
        }
        createEmptyBackgroundRing();
        opts.$container.appendChild($chart);

        me.update = function (data) {
            loopOverSectors(function (sector) {
                setNewSectorValue(sector, data[sector.name]);
                removePathPie(sector.$path);
            });
            drawPaths();
        };

        function drawPaths() {
            calculateTotal();
            if (animated === true) {
                drawWithAnimation();
            } else {
                draw();
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
            var sector = opts.definition[counter], timeout, currentValue = 0, newStartAngle,
                    timeoutFn = function () {
                        currentValue += speed;
                        newStartAngle = updatePath(sector.$path, startAngle, currentValue);
                        if (currentValue < sector.value) {
                            timeout = setTimeout(timeoutFn, 10);
                        } else if (counter < length - 1) {
                            counter += 1;
                            newStartAngle += startAngle;
                            currentValue = 0;
                            anim(newStartAngle, length, counter);
                        }
                    };
            if (shouldDrawSection(sector)) {
                timeout = setTimeout(timeoutFn, 10);
            }
        }

        function draw() {
            var startAngle = -PI / 2;
            loopOverSectors(function (sector) {
                if (shouldDrawSection(sector)) {
                    startAngle += updatePath(sector.$path, startAngle, sector.value);
                }
            });
        }

        function updatePath($path, startAngle, value) {
            var sectorAngle = (value / total) * (PI * 2),
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
            total = 0;
            loopOverSectors(function (sector) {
                sector.value = parseInt(sector.value || 0);
                total += sector.value;
            });
        }


        function addPaths() {
            loopOverSectors(addPath);
        }

        function addPath(sector) {
            var $path = createSvgElement('path');
            $path.setAttributeNS(null, "class", sector.cls);
            $chart.appendChild($path);
            sector.$path = $path;
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

        function createBacgroundRing() {
            var $bacground = createCircle(centerOfTheCircle, centerOfTheCircle);
            $bacground.setAttributeNS(null, "class", "ring-chart-background");
            $chart.appendChild($bacground);
        }

        function createEmptyBackgroundRing() {
            var $emptyCircle = createCircle(centerOfTheCircle, size * ringProportion);
            $emptyCircle.setAttributeNS(null, "class", "ring-chart-background-empty");
            $chart.appendChild($emptyCircle);
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
            return section.value > 0;
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

    };


    var $container = document.getElementById('chart'),
            chart = new PieChart({
                $container: $container,
                definition: [
                    {name: 'poznan', cls: 'poznan', value: 7},
                    {name: 'warszawa', cls: 'warszawa', value: 34},
                    {name: 'srem', cls: 'srem', value: 8},
                    {name: 'gdansk', cls: 'gdansk', value: 10}
                ]
            });

})();