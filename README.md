# babel-plugin-transform-sp-jx

Transform spRepeat, spShow, sp<Event>

Options can be defined per file by adding a comment like this `/* @sp-jsx { "repeat": "_.map" } */`

## Examples

```javascript
const fs = require("fs");
const sysPath = require("path");
const babel = require("babel-core");

const options = {
    plugins: [
        "syntax-jsx",
        ["transform-sp-jx", { repeat: "_.map" }]
    ]
};

console.log(babel.transform("<button spClick={ this.changeLanguage(event, lng) }></button>", options).code);
console.log(babel.transform("<button spShow={ condition }></button>", options).code);
console.log(babel.transform('<button spRepeat={ 4 } type="button" className="btn btn-default" data-lng={ index } />', options).code);
console.log(babel.transform('<button spRepeat="locale in locales" spShow={condition} spClick={ this.changeLanguage(event, lng) }/>', options).code);
console.log(babel.transform('<button spShow={condition} spRepeat="locale in locales" spClick={ this.changeLanguage(event, lng) }/>', options).code);
```

```jsx
<button onClick={function (event, domID, originalEvent) {
  this.changeLanguage(event, lng);
}.bind(this)}></button>;

condition ? <button></button> : void 0;

(function (cb) {
  var res = new Array(4);

  for (var i = 0; i < 4; i++) {
    res[i] = cb(i);
  }

  return res;
})(function (index) {
  return <button type="button" className="btn btn-default" data-lng={index} />;
}.bind(this));

_.map(locales, function (locale) {
  return condition ? <button onClick={function (event, domID, originalEvent) {
    this.changeLanguage(event, lng);
  }.bind(this)} /> : void 0;
}.bind(this));

condition ? _.map(locales, function (locale) {
  return <button onClick={function (event, domID, originalEvent) {
    this.changeLanguage(event, lng);
  }.bind(this)} />;
}.bind(this)) : void 0;
```

## Options

### events `<Array: String>`

Attributes to treat as events.

Default:

```javascript
[
    "spBlur",
    "spChange",
    "spClick",
    "spDrag",
    "spDrop",
    "spFocus",
    "spInput",
    "spLoad",
    "spMouseenter",
    "spMouseleave",
    "spMousemove",
    "spPropertychange",
    "spReset",
    "spScroll",
    "spSubmit",
    "spAbort",
    "spCanplay",
    "spCanplaythrough",
    "spDurationchange",
    "spEmptied",
    "spEncrypted",
    "spEnded",
    "spError",
    "spLoadeddata",
    "spLoadedmetadata",
    "spLoadstart",
    "spPause",
    "spPlay",
    "spPlaying",
    "spProgress",
    "spRatechange",
    "spSeeked",
    "spSeeking",
    "spStalled",
    "spSuspend",
    "spTimeupdate",
    "spVolumechange",
    "spWaiting"
]
```

### repeat `<String>`

Repeat function to use

Default:

```javascript
"(function(obj, cb) { return obj === null || typeof obj !== 'object' ? [] : Array.isArray(obj) ? obj.map(cb) : Object.keys(obj).map(function(key) { return cb(obj[key], key) });})"
```


### noVoid `<Boolean>`

Use `undefined` instead of `void 0`

# License

The MIT License (MIT)

Copyright (c) 2018 Stéphane MBAPE (http://smbape.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

