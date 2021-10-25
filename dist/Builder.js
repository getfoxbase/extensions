"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rollup = require("rollup");

var _pluginAutoInstall = _interopRequireDefault(require("@rollup/plugin-auto-install"));

var _pluginCommonjs = _interopRequireDefault(require("@rollup/plugin-commonjs"));

var _pluginNodeResolve = require("@rollup/plugin-node-resolve");

var _pluginBabel = require("@rollup/plugin-babel");

var _rollupPluginTerser = require("rollup-plugin-terser");

var _uuid = require("uuid");

var _memfs = require("memfs");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _isomorphicGit = _interopRequireDefault(require("isomorphic-git"));

var _node = _interopRequireDefault(require("isomorphic-git/http/node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Builder {
  static buildFromGit(url) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const vol = _memfs.Volume.fromJSON({}, `/`);

      yield _isomorphicGit.default.clone({
        fs: vol,
        http: _node.default,
        dir: `/`,
        url,
        singleBranch: true,
        depth: 1
      });
      const files = Object.fromEntries(Object.entries(vol.toJSON()).filter(file => file[0].substring(0, 6) !== '/.git/').map(file => {
        file[0] = file[0].substr(1);
        return file;
      }));
      return yield _this.build(files);
    })();
  }

  static ensureDirectoryExistence(filePath) {
    const dirname = _path.default.dirname(filePath);

    if (_fs.default.existsSync(dirname)) {
      return true;
    }

    this.ensureDirectoryExistence(dirname);

    _fs.default.mkdirSync(dirname);
  }

  static build(sourceFiles) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var _output$;

      const buildId = (0, _uuid.v4)(); // Create folder and files

      _fs.default.mkdirSync(`./${buildId}`);

      for (const filename in sourceFiles) {
        _this2.ensureDirectoryExistence(`./${buildId}/${filename}`);

        _fs.default.writeFileSync(`./${buildId}/${filename}`, sourceFiles[filename]);
      } // Determine main script


      let mainScript = 'index.js';

      if (_fs.default.existsSync(`./${buildId}/package.json`)) {
        try {
          var _packageJson$main;

          let packageJson = JSON.parse(_fs.default.readFileSync(`./${buildId}/package.json`));
          mainScript = (_packageJson$main = packageJson.main) !== null && _packageJson$main !== void 0 ? _packageJson$main : 'index.js';
        } catch (_unused) {}
      } // Rollup options


      const inputOptions = {
        input: `./${buildId}/${mainScript}`,
        plugins: [(0, _pluginAutoInstall.default)({
          pkgFile: `./${buildId}/package.json`,
          manager: 'npm'
        }), (0, _pluginNodeResolve.nodeResolve)(), (0, _pluginCommonjs.default)({
          transformMixedEsModules: true,
          esmExternals: true
        }), (0, _pluginBabel.babel)({
          babelHelpers: 'bundled'
        }), (0, _rollupPluginTerser.terser)()]
      };
      const outputOptions = {
        file: `./${buildId}/__build__.js`,
        format: 'cjs'
      }; // Build with Rollup and Babel

      const bundle = yield (0, _rollup.rollup)(inputOptions);
      const {
        output
      } = yield bundle.generate(outputOptions);
      const code = (_output$ = output[0]) === null || _output$ === void 0 ? void 0 : _output$.code;
      yield bundle.close(); // Clean build folder

      for (const filename in sourceFiles) {
        _fs.default.unlinkSync(`./${buildId}/${filename}`);
      }

      if (_fs.default.existsSync(`./${buildId}/package.json`)) {
        _fs.default.unlinkSync(`./${buildId}/package.json`);
      }

      _fs.default.rmdirSync(`./${buildId}`, {
        recursive: true
      });

      return code;
    })();
  }

}

exports.default = Builder;
//# sourceMappingURL=Builder.js.map