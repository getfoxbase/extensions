# Foxbase Extension Builder

This library aims to help foxbase users to use 3rd-party JS code and run it in a NodeJS environment. It uses Babel and Rollup to create a ready-to-use JS code string.

## Usage

You can use the builder from an object codebase, or directly clone a public git repo. If there is a `package.json` file, the `main` field will be used as entrypoint. As default entrypoint, the builder will use `index.js` file.

You can import code from others npm packages, they'll be automatically downloaded and used.

### Object codebase

This object represents a codebase, like a folder :

```javascript
import { Builder } from "@foxbase/extensions";

const files = {
  "index.js": `import moment from 'moment';
import DateFormatter from './src/DateFormatter';

export default {
    currentDate: DateFormatter.format(moment())
};`,
  "src/DateFormatter.js": `export default class DateFormatter {
    static format(momentObj) {
        return momentObj.format();
    }
}`,
};

Builder.build(files).then((code) => {
  const ret = eval(code);
  console.log(ret.currentDate);
});
```

### Clone from public git repo

```javascript
import { Builder } from "@foxbase/extensions";

Builder.buildFromGit("https://github.com/vuejs/vue.git").then((code) => {
  // Do what you want
});
```
