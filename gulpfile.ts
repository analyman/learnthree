import * as gulp       from 'gulp';
import * as sass       from 'gulp-sass';
sass.compiler = require('dart-sass');
import * as sourcemaps from 'gulp-sourcemaps';
import * as merge      from 'merge2';
import * as rimraf     from 'rimraf';
import * as typescript from 'gulp-typescript';
import * as vinyl_buffer from 'vinyl-buffer';
import * as vinyl_source_stream from 'vinyl-source-stream';

import * as browserify from 'browserify';
import * as tsify      from 'tsify';

import * as path from 'path';
import * as util from 'util';
import * as proc from 'process';

import * as annautils from 'annautils';


const project_name = "learnthree";

const project_root = "./";
const doc_root     = "./docroot";
const tsconfig     = "./tsconfig.json";

function onerror(err) {
    console.log(err.toString());
    this.emit("end");
}

// browser javascript - compile_ts() //{
function browser_compile_ts_dir(entry: string, destination: string, sourceMaps: boolean = false) {
    return function() {
        let sm = browserify({debug: true})
        .add(entry)
        .plugin("tsify", {target: 'es6', project: tsconfig}).on("error", onerror)
        .bundle().on("error", onerror)
        .pipe(vinyl_source_stream(path.basename(entry.replace(".ts", ".js"))));

        if (sourceMaps)
            return sm.pipe(vinyl_buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(destination));
        else
            return sm.pipe(gulp.dest(destination));
    }
}

let js_entry = browser_compile_ts_dir(path.join(project_root, "/bin/main.ts"), doc_root, true);
//}

// styles - sass and css - sytles__() //{
function sass_compile_move() {
    return gulp.src(path.join(project_root, "styles/*.scss"))
    .pipe(sass().on("error", onerror))
    .pipe(gulp.dest(path.join(doc_root, "styles/")));
}
function css_copy() {
    return gulp.src(path.join(project_root, "styles/*.css"))
    .pipe(gulp.dest(path.join(doc_root, "styles/")));
}
function styles__() {
    return merge([
        sass_compile_move(),
        css_copy()
    ]);
}
//}

// asset asset_copy() //{
function asset_copy() {
    return gulp.src(path.join(project_root, "asset/*"))
    .pipe(gulp.dest(path.join(doc_root, "asset/")));
}
//}

// html - htmls_copy() //{
function htmls_copy() {
    return gulp.src(path.join(project_root, "html/**/*.html"))
    .pipe(gulp.dest(doc_root));
}
//}

export function watch() //{
{
    let watcher = gulp.watch([
        "lib/**/*.ts", "bin/**/*.ts", "styles/*.scss", 
        "html/*.html", "asset/**", "index*"
    ].map(x => path.join(project_root, x)));
    let handle = (fp: string, stat) => {
        console.log(`[${fp}] fires event`);
        let fp_split = fp.split("/");
        switch (fp_split[0]) {
            case "lib":
            case "bin":
                console.log("browser javascript");
                return js_entry();
            case "styles":
                console.log("styles");
                return styles__();
            case "html":
                console.log("htmls");
                return htmls_copy();
            case "asset":
                console.log("asset");
                return asset_copy();
            default:
                console.log("unknown");
        }
    }
    watcher.on("change", handle);
    watcher.on("add", handle);
    watcher.on("unlink", handle);
    watcher.on("error", onerror);
} //}

export function doit() {
gulp.task("browserjs", js_entry);
gulp.task("app", gulp.parallel(js_entry, styles__, asset_copy, htmls_copy));
gulp.task("watch", () => watch());

gulp.task("default", gulp.series("app"));

// clean //{
gulp.task("clean", () => {
    let dirs = [
        doc_root
    ];
    for (let vv of dirs) {
        try {
            rimraf.sync(vv);
        } catch (e) {
            console.error(e);
        }
    }
    return Promise.resolve(true);
});
//}
}

doit();

