const { src, dest, watch, series, parallel } = require("gulp"); // Gulpの基本関数をインポート
const sass = require("gulp-sass")(require("sass")); // SCSSをCSSにコンパイルするためのモジュール
const plumber = require("gulp-plumber"); // エラーが発生してもタスクを続行するためのモジュール
const notify = require("gulp-notify"); // エラーやタスク完了の通知を表示するためのモジュール
const sassGlob = require("gulp-sass-glob-use-forward"); // SCSSのインポートを簡略化するためのモジュール
const mmq = require("gulp-merge-media-queries"); // メディアクエリをマージするためのモジュール
const postcss = require("gulp-postcss"); // CSSの変換処理を行うためのモジュール
const autoprefixer = require("autoprefixer"); // ベンダープレフィックスを自動的に追加するためのモジュール
const cssdeclsort = require("css-declaration-sorter"); // CSSの宣言をソートするためのモジュール
const cssnext = require("postcss-cssnext"); // 最新のCSS構文を使用可能にするためのモジュール
const rename = require("gulp-rename"); // ファイル名を変更するためのモジュール
const sourcemaps = require("gulp-sourcemaps"); // ソースマップを作成するためのモジュール
const babel = require("gulp-babel"); // ES6+のJavaScriptをES5に変換するためのモジュール
const uglify = require("gulp-uglify"); // JavaScriptを圧縮するためのモジュール
const imageminSvgo = require("imagemin-svgo"); // SVGを最適化するためのモジュール
const browserSync = require("browser-sync"); // ブラウザの自動リロード機能を提供するためのモジュール
const imagemin = require("gulp-imagemin"); // 画像を最適化するためのモジュール
const imageminMozjpeg = require("imagemin-mozjpeg"); // JPEGを最適化するためのモジュール
const imageminPngquant = require("imagemin-pngquant"); // PNGを最適化するためのモジュール
const changed = require("gulp-changed"); // 変更されたファイルのみを対象にするためのモジュール
const del = require("del"); // ファイルやディレクトリを削除するためのモジュール
const webp = require('gulp-webp');//webp変換

const themeName = "WordPressTheme"; // WordPress theme name
// 読み込み先
const srcPath = {
  json: "./**/*.json",
  css: "./sass/**/*.scss",
  js: "./js/**/*",
  img: "./images/**/*",
  ejs: "./ejs/**/*.ejs",
  html: ["./**/*.html", "!./node_modules/**"],
  php: `../${themeName}/**/*.php`,
};

// html反映用
const destPath = {
  all: "../dist/**/*",
  css: "../dist/assets/css/",
  js: "../dist/assets/js/",
  img: "../dist/assets/images/",
  html: "../dist/",
};

// WordPress反映用
const destWpPath = {
  all: `../${themeName}/assets/**/*`,
  css: `../${themeName}/assets/css/`,
  js: `../${themeName}/assets/js/`,
  img: `../${themeName}/assets/images/`,
};

const browsers = ["last 2 versions", "> 5%", "ie = 11", "not ie <= 10", "ios >= 8", "and_chr >= 5", "Android >= 5"];


const cssSass = () => {
  // ソースファイルを指定
  return (
    src(srcPath.css)
      // ソースマップを初期化
      .pipe(sourcemaps.init())
      // エラーハンドリングを設定
      .pipe(
        plumber({
          errorHandler: notify.onError("Error:<%= error.message %>"),
        })
      )
      // Sassのパーシャル（_ファイル）を自動的にインポート
      .pipe(sassGlob())
      // SassをCSSにコンパイル
      .pipe(
        sass.sync({
          includePaths: ["src/sass"],
          outputStyle: "expanded", // コンパイル後のCSSの書式（expanded or compressed）
        })
      )
      // ベンダープレフィックスを自動付与
      .pipe(
        postcss([
          autoprefixer({
            grid: true,
          }),
        ])
      )
      // CSSプロパティをアルファベット順にソートし、未来のCSS構文を使用可能に
      .pipe(postcss([cssdeclsort({ order: "alphabetical" }), cssnext(browsers)]))
      // メディアクエリを統合
      .pipe(mmq())
      // ソースマップを書き出し
      .pipe(sourcemaps.write("./"))
      // コンパイル済みのCSSファイルを出力先に保存
      .pipe(dest(destPath.css))
      .pipe(dest(destWpPath.css))
      // Sassコンパイルが完了したことを通知
      .pipe(
        notify({
          message: "Sassをコンパイルしました！",
          onLast: true,
        })
      )
  );
};

//ejsのコンパイル
const ejs = require("gulp-ejs");
const replace = require("gulp-replace");
const htmlbeautify = require("gulp-html-beautify");
const srcEjsDir = "./ejs";
const fs = require("fs"); //JSONファイル操作用

const ejsCompile = (done) => {
  var jsonFile = "./ejs/pageData/pageData.json",
    json = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

  // EJSファイルを指定（パーシャルファイル（_ファイル）を除く）
  src([srcEjsDir + "/**/*.ejs", "!" + srcEjsDir + "/**/_*.ejs"])
    // エラーハンドリングを設定
    .pipe(
      plumber({
        errorHandler: notify.onError(function (error) {
          return {
            message: "Error: <%= error.message %>",
            sound: false,
          };
        }),
      })
    )
    .pipe(ejs({ json: json }))
    // EJSファイルをHTMLにコンパイル
    .pipe(ejs({}))
    // 拡張子を.htmlに変更
    .pipe(rename({ extname: ".html" }))
    // 空白行を削除
    .pipe(replace(/^[ \t]*\n/gim, ""))
    // HTMLファイルを整形
    .pipe(
      htmlbeautify({
        indent_size: 2, // インデントサイズ
        indent_char: " ", // インデントに使用する文字
        max_preserve_newlines: 0, // 連続改行の最大数
        preserve_newlines: false, // 改行を維持するかどうか
        extra_liners: [], // 追加の改行を挿入する要素
      })
    )
    // コンパイル済みのHTMLファイルを出力先に保存
    .pipe(dest(destPath.html));
  // 完了を通知
  done();
};

// 画像圧縮
const imgImagemin = () => {
  // 画像ファイルを指定
  return (
    src(srcPath.img)
      // 変更があった画像のみ処理対象に
      .pipe(changed(destPath.img))
      // 画像を圧縮
      .pipe(
        imagemin(
          [
            // JPEG画像の圧縮設定
            imageminMozjpeg({
              quality: 80, // 圧縮品質（0〜100）
            }),
            // PNG画像の圧縮設定
            imageminPngquant(),
            // SVG画像の圧縮設定
            imageminSvgo({
              plugins: [
                {
                  removeViewbox: false, // viewBox属性を削除しない
                },
              ],
            }),
          ],
          {
            verbose: true, // 圧縮情報を表示
          }
        )
      )
      // 圧縮済みの画像ファイルを出力先に保存
      .pipe(dest(destPath.img))
      .pipe(dest(destWpPath.img))
      .pipe(webp())//webpに変換
      // 圧縮済みの画像ファイルを出力先に保存
      .pipe(dest(destPath.img))
      .pipe(dest(destWpPath.img))
  );
};

// js圧縮
const jsBabel = () => {
  // JavaScriptファイルを指定
  return (
    src(srcPath.js)
      // エラーハンドリングを設定
      .pipe(
        plumber({
          errorHandler: notify.onError("Error: <%= error.message %>"),
        })
      )
      // Babelでトランスパイル（ES6からES5へ変換）
      .pipe(
        babel({
          presets: ["@babel/preset-env"],
        })
      )
      // 圧縮済みのファイルを出力先に保存
      .pipe(dest(destPath.js))
      .pipe(dest(destWpPath.js))
  );
};

// ブラウザーシンク
const browserSyncOption = {
  notify: false,
  server: "../dist/", // ローカルサーバーのルートディレクトリ
  //WordPressの場合は↓を有効にする。その場合、↑(server)はコメントアウトする。
  // proxy: "http://test.local/", // ローカルサーバーのURL（WordPress）
};
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
};
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
};

// ファイルの削除
const clean = () => {
  return del([destPath.all, destWpPath.all], { force: true });
};

// ファイルの監視
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, browserSyncReload));
  watch(srcPath.js, series(jsBabel, browserSyncReload));
  watch(srcPath.img, series(imgImagemin, browserSyncReload));
  watch(srcPath.ejs, series(ejsCompile, browserSyncReload));
  watch(srcPath.php, browserSyncReload);
};

// ブラウザシンク付きの開発用タスク
exports.default = series(series(cssSass, jsBabel, imgImagemin, ejsCompile), parallel(watchFiles, browserSyncFunc));

// 本番用タスク
exports.build = series(clean, cssSass, jsBabel, imgImagemin, ejsCompile);
