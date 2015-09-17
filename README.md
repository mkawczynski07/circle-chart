# pie-chart
Simple javascript pie chart based on svg.

# How to use:

```
    var $container = document.getElementById('chart'),
            chart = new RingChart({
                $container: $container,
                definition: [
                    {name: 'poznan', cls: 'poznan', value: 7},
                    {name: 'warszawa', cls: 'warszawa', value: 34},
                    {name: 'srem', cls: 'srem', value: 8},
                    {name: 'gdansk', cls: 'gdansk', value: 10}
                ]
            });
```

# Live Example
http://jsfiddle.net/6ym5cuk8/