"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Builder = /*#__PURE__*/function () {
  function Builder() {
    _classCallCheck(this, Builder);
  }

  _createClass(Builder, null, [{
    key: "buildFromGit",
    value: function () {
      var _buildFromGit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var vol, files;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                vol = _memfs.Volume.fromJSON({}, "/");
                _context.next = 3;
                return _isomorphicGit["default"].clone({
                  fs: vol,
                  http: _node["default"],
                  dir: "/",
                  url: url,
                  singleBranch: true,
                  depth: 1
                });

              case 3:
                files = Object.fromEntries(Object.entries(vol.toJSON()).filter(function (file) {
                  return file[0].substring(0, 6) !== '/.git/';
                }).map(function (file) {
                  file[0] = file[0].substr(1);
                  return file;
                }));
                _context.next = 6;
                return this.build(files);

              case 6:
                return _context.abrupt("return", _context.sent);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function buildFromGit(_x) {
        return _buildFromGit.apply(this, arguments);
      }

      return buildFromGit;
    }()
  }, {
    key: "ensureDirectoryExistence",
    value: function ensureDirectoryExistence(filePath) {
      var dirname = _path["default"].dirname(filePath);

      if (_fs["default"].existsSync(dirname)) {
        return true;
      }

      this.ensureDirectoryExistence(dirname);

      _fs["default"].mkdirSync(dirname);
    }
  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(sourceFiles) {
        var _output$;

        var buildId, filename, mainScript, _packageJson$main, packageJson, inputOptions, outputOptions, bundle, _yield$bundle$generat, output, code, _filename;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                buildId = (0, _uuid.v4)(); // Create folder and files

                _fs["default"].mkdirSync("./".concat(buildId));

                for (filename in sourceFiles) {
                  this.ensureDirectoryExistence("./".concat(buildId, "/").concat(filename));

                  _fs["default"].writeFileSync("./".concat(buildId, "/").concat(filename), sourceFiles[filename]);
                } // Determine main script


                mainScript = 'index.js';

                if (_fs["default"].existsSync("./".concat(buildId, "/package.json"))) {
                  try {
                    packageJson = JSON.parse(_fs["default"].readFileSync("./".concat(buildId, "/package.json")));
                    mainScript = (_packageJson$main = packageJson.main) !== null && _packageJson$main !== void 0 ? _packageJson$main : 'index.js';
                  } catch (_unused) {}
                } // Rollup options


                inputOptions = {
                  input: "./".concat(buildId, "/").concat(mainScript),
                  plugins: [(0, _pluginAutoInstall["default"])({
                    pkgFile: "./".concat(buildId, "/package.json"),
                    manager: 'npm'
                  }), (0, _pluginNodeResolve.nodeResolve)(), (0, _pluginCommonjs["default"])({
                    transformMixedEsModules: true,
                    esmExternals: true
                  }), (0, _pluginBabel.babel)({
                    babelHelpers: 'bundled'
                  }), (0, _rollupPluginTerser.terser)()]
                };
                outputOptions = {
                  file: "./".concat(buildId, "/__build__.js"),
                  format: 'cjs'
                }; // Build with Rollup and Babel

                _context2.next = 9;
                return (0, _rollup.rollup)(inputOptions);

              case 9:
                bundle = _context2.sent;
                _context2.next = 12;
                return bundle.generate(outputOptions);

              case 12:
                _yield$bundle$generat = _context2.sent;
                output = _yield$bundle$generat.output;
                code = (_output$ = output[0]) === null || _output$ === void 0 ? void 0 : _output$.code;
                _context2.next = 17;
                return bundle.close();

              case 17:
                // Clean build folder
                for (_filename in sourceFiles) {
                  _fs["default"].unlinkSync("./".concat(buildId, "/").concat(_filename));
                }

                if (_fs["default"].existsSync("./".concat(buildId, "/package.json"))) {
                  _fs["default"].unlinkSync("./".concat(buildId, "/package.json"));
                }

                _fs["default"].rmdirSync("./".concat(buildId), {
                  recursive: true
                });

                return _context2.abrupt("return", code);

              case 21:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function build(_x2) {
        return _build.apply(this, arguments);
      }

      return build;
    }()
  }]);

  return Builder;
}();

exports["default"] = Builder;