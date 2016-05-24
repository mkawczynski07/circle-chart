# Circle Chart

 It is simple circle chart component, based on SVG. Online [demo](http://mkawczynski07.github.io/circle-chart/).

## Install

You can install manually or either by using npm:

```
npm install circle-chart
```

## Usage
Simple donut chart:
```javascript
            new CircleChart({
                $container: document.getElementById('donut'),
                ringProportion: 0.42,
                middleCircleColor: '#BDBDBD',
                background: '#D1C4E9',
                definition: [
                    {label: 'Poznan', name: 'poznan', cls: 'poznan', value: 1},
                    {label: 'Warszawa', name: 'warszawa', color: '#D84315', value: 1},
                    {label: 'Srem', name: 'srem', cls: 'srem', value: 1},
                    {label: 'Gdansk', name: 'gdansk', cls: 'gdansk', value: 1}
                ]
            });
```

## Options
 *  **container** - Chart container, for example a div
 *  **size** - Radius of the circle. In default it takes width of the container
 *  **staticTotal** - If set to true, total value will be not calculated. It will be taken from **total** option. Default - false.
 *  **total** - Chart total value. In default it is calculated from data.
 *  **ringProportion** - Middle circle proportion to container size. It is used with donut charts only.
 *  **middleCircleColor** - Middle circle bacground color. In default it will add only **circle-chart-background-empty** to the path.
 *  **background** - Bacground of the chart. In default it will add **circle-chart-background** to the circle.
 *  **animated** - If set to true chart will be animated. Default - true.
 *  **speed** - Speed of the animation. Default 1.
 *  **durration** - Sleep time duration between chart's path update. In ms, default - 10.
 *  **tooltips** - If set to true tooltips will be displayed on click. Default - false.
 *  **definition** - Array of chart paths definition. It contains objects with:
   -  **label** - Label of the path
   -  **name** - Name of the attribute in data object
   - **cls** - Path's css class name
   - **color** - Path's color.
   - **value** - Initial value

## Events
 * **onAfterRender** - Triggered when the chart render.
 * **onUpdateStart** - Triggered before start updating chart.
 * **onUpdateEnd** - Triggered after update chart.
 * **onPathClick** - Triggered on path click.

## Methods
 *  **update(data)** - It is update chart values. Data is an object with values defined according to definition. 
```javascript
            var updateChart = new CircleChart({
                $container: document.getElementById('update-chart'),
                ringProportion: 0.42,
                middleCircleColor: '#BDBDBD',
                background: '#D1C4E9',
                tooltips: true,
                definition: [
                    {label: 'Poznan', name: 'poznan', cls: 'poznan', value: 1},
                    {label: 'Warszawa', name: 'warszawa', color: '#D84315', value: 1},
                    {label: 'Srem', name: 'srem', cls: 'srem', value: 1},
                    {label: 'Gdansk', name: 'gdansk', cls: 'gdansk', value: 1}
                ]
            });
            document.querySelector('#update-chart-trigger').addEventListener('click', function(e){
                e.preventDefault();
                updateChart.update({
                    poznan: 10,
                    warszawa: 1,
                    srem: 8,
                    gdansk: 0
                });
            });
```
 *  **setTotal(value)** - Set total value of the chart.

## How to run example page?

 Clone repository and:
```
 npm install
 gulp
```

## License

MIT: https://github.com/mkawczynski07/circle-chart/blob/master/LICENSE
