# reactive
Javascript reactive object

Turn a property to reactive object and watch value change. The property value should be primitive, or json object(no functions, no get/set property).



## NOTICE
Create a new property through operator =, won't make it reactive. Use "set" method to do so. After "set", you can use = to assign new value.
