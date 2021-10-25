import { Builder } from '../';

const files = {
    'index.js': `import moment from 'moment';
import DateFormatter from './src/DateFormatter';

export default {
    currentDate: DateFormatter.format(moment())
};`,
    'src/DateFormatter.js': `export default class DateFormatter {
    static format(momentObj) {
        return momentObj.format();
    }
}`
};

Builder
    .build(files)
    .then(code => {
        const ret = eval(code);
        console.log(ret.currentDate);
    });