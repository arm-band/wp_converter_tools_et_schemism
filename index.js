const fs           = require('fs');
const path         = require('path');
const xml2js       = require('xml2js');
const native2ascii = require('native2ascii')
const settingsFile = 'settings.json';

const isExistFile = (file) => {
    try {
        fs.statSync(file);
        return true;
    } catch(err) {
        if(err.code === 'ENOENT') {
            return false;
        }
    }
};
const fileRead = (filepath) => {
    return fs.readFileSync(filepath, 'utf8');
};
const jsonParser = (jsonStr) => {
    return JSON.parse(jsonStr);
};
const jsonStringify = (jsObj) => {
    if (jsObj === undefined || jsObj === null || jsObj.length <= 0) {
        console.log('データが存在しません。');
        return [];
    }
    return native2ascii.native2ascii(JSON.stringify(jsObj));
};
const xmlParser = (xmlStr) => {
    if (xmlStr === undefined || xmlStr === null || xmlStr.length <= 0) {
        console.log('XML データが存在しません。');
        return [];
    }
    const xml2jsParser = xml2js.parseString;
    return new Promise(function(resolve, reject) {
        xml2jsParser(xmlStr, function(err, result) {
            if(err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
const flagConvert = (intStr) => {
    if (intStr === "0") {
        return "false";
    }
    return "true";
};
const hierarchicalConvert = (intStr) => {
    if (intStr === "hierarchical") {
        return "true";
    }
    return "false";
};
const publicConvert = (intStr) => {
    if (intStr === "public") {
        return "true";
    }
    return "false";
};
const keyExist = (val) => {
    if (val !== undefined && val !== null && val.length > 0) {
        return "true";
    }
    return "false";
};
const keySet = (array) => {
    let returnArray = [];
    for (const [key, val] of Object.entries(array)) {
        if(val[0] === '1') {
            returnArray.push(key);
        }
    }
    return returnArray;
};
const pigeonholeTaxonomy = (inputObj, baseObj) => {
    // name, slug, lables
    baseObj.name = inputObj.taxonomy.slug[0];
    baseObj.label = inputObj.taxonomy.labels[0].name[0];
    baseObj.singular_label = inputObj.taxonomy.labels[0].singular_name[0];
    // labels object
    for (const [key, val] of Object.entries(baseObj.labels)) {
        if (inputObj.taxonomy.labels[0][key] !== undefined && inputObj.taxonomy.labels[0][key] !== null) {
            baseObj.labels[key] = inputObj.taxonomy.labels[0][key][0].replace('%s', inputObj.taxonomy.labels[0].name[0]);
        }
    }
    // hierarchical
    baseObj.hierarchical = hierarchicalConvert(inputObj.taxonomy.hierarchical[0]);
    // rewrite object
    baseObj.rewrite = flagConvert(inputObj.taxonomy.rewrite[0].enabled[0]);
    baseObj.rewrite_slug = inputObj.taxonomy.rewrite[0].slug[0];
    baseObj.rewrite_withfront = inputObj.taxonomy.rewrite[0].with_front[0];
    baseObj.rewrite_hierarchical = inputObj.taxonomy.rewrite[0].hierarchical[0];
    // show ui
    baseObj.show_ui = inputObj.taxonomy.show_ui[0];
    baseObj.show_admin_column = inputObj.taxonomy.show_in_nav_menus[0];
    // query var
    baseObj.query_var = inputObj.taxonomy.query_var_enabled[0];
    baseObj.query_var_slug = inputObj.taxonomy.query_var[0];
    // object_types
    baseObj.object_types[0] = inputObj.taxonomy.id[0];
    return {
        [inputObj.taxonomy.id]: baseObj
    };
};
const pigeonholePost = (inputObj, baseObj) => {
    // name, slug, lables
    baseObj.name = inputObj.type.slug[0];
    baseObj.label = inputObj.type.labels[0].name[0];
    baseObj.singular_label = inputObj.type.labels[0].singular_name[0];
    // other properties
    baseObj.description = inputObj.type.description[0];
    baseObj.public = publicConvert(inputObj.type.public[0]);
    baseObj.has_archive = flagConvert(inputObj.type.has_archive[0]);
    baseObj.exclude_from_search = keyExist(inputObj.type.exclude_from_search);
    // hierarchical
    baseObj.hierarchical = keyExist(inputObj.type.hierarchical);
    baseObj.capability_type = baseObj.hierarchical === 'true' ? 'page' : 'post';
    // labels object
    for (const [key, val] of Object.entries(baseObj.labels)) {
        if (inputObj.type.labels[0][key] !== undefined && inputObj.type.labels[0][key] !== null) {
            baseObj.labels[key] = inputObj.type.labels[0][key][0].replace('%s', inputObj.type.labels[0].name[0]);
        }
    }
    // rewrite object
    baseObj.rewrite = flagConvert(inputObj.type.rewrite[0].enabled[0]);
    baseObj.rewrite_slug = inputObj.type.rewrite[0].slug[0];
    baseObj.rewrite_withfront = flagConvert(inputObj.type.rewrite[0].with_front[0]);
    // menu
    baseObj.menu_position = inputObj.type.menu_position[0];
    baseObj.menu_icon = inputObj.type.icon[0] ? 'dashicons-' + inputObj.type.icon[0] : null;
    // show ui
    baseObj.show_ui = flagConvert(inputObj.type.show_ui[0]);
    baseObj.show_in_menu_string = inputObj.type.show_in_menu_page[0];
    // query var
    baseObj.query_var = flagConvert(inputObj.type.query_var_enabled[0]);
    // array
    baseObj.supports = keySet(inputObj.type.supports[0]);
    baseObj.taxonomies = keySet(inputObj.type.taxonomies[0]);
    return {
        [inputObj.type.id]: baseObj
    };
};
const fileWrite = (distFilePath, str) => {
    if (str === undefined || str === null || str.length <= 0) {
        console.log('データが存在しません。');
        return false;
    }
    fs.writeFileSync(distFilePath, str, (err) => {
        if(err) {
            console.log(`ファイル書き込みに失敗しました: ${err}`);
            return false;
        }
    });
};

const settingsFilePath = path.join('.', settingsFile);

if(!isExistFile(settingsFilePath)) {
    console.log(`設定ファイル ${settingsFile} が存在しません。`);
    return false;
}

const settings = jsonParser(fileRead(settingsFile));

if(!isExistFile(settings.srcDir)) {
    console.log('ソースディレクトリ が存在しません。');
    return false;
}
if(!isExistFile(settings.distDir)) {
    console.log('ターゲットディレクトリ が存在しません。');
    return false;
}

const srcFilePath = path.join(path.join('.', settings.srcDir), settings.srcFile);

if(!isExistFile(srcFilePath)) {
    console.log('ソースファイル が存在しません。');
    return false;
}

let type = 'post'; // custom post
if(process.argv[2] !== undefined && process.argv[2] !== null && process.argv[2].length > 0) {
    if(process.argv[2] == 'tax') {
        type = process.argv[2]; // custom taxonomy
    }
}

if (type === 'post') {
    const basePostFilePath = path.join('.', settings.basePostFile);

    if(!isExistFile(basePostFilePath)) {
        console.log(`ベースファイル ${settings.basePostFile} が存在しません。`);
        return false;
    }

    const baseSettings = jsonParser(fileRead(basePostFilePath));

    xmlParser(fileRead(srcFilePath)).then((result) => {
        const jsonStr = jsonStringify(pigeonholePost(result, baseSettings));
        const distPostFilePath = path.join(path.join('.', settings.distDir), settings.distPostFile);
        fileWrite(distPostFilePath, jsonStr);
    })
    .catch((err) => {
        console.log(`XML の解析に失敗しました: ${err}`);
    });
}
else {
    const baseTaxonomyFilePath = path.join('.', settings.baseTaxonomyFile);

    if(!isExistFile(baseTaxonomyFilePath)) {
        console.log(`ベースファイル ${settings.baseTaxonomyFile} が存在しません。`);
        return false;
    }

    const baseSettings = jsonParser(fileRead(baseTaxonomyFilePath));

    xmlParser(fileRead(srcFilePath)).then((result) => {
        const jsonStr = jsonStringify(pigeonholeTaxonomy(result, baseSettings));
        const distTaxonomyFilePath = path.join(path.join('.', settings.distDir), settings.distTaxonomyFile);
        fileWrite(distTaxonomyFilePath, jsonStr);
    })
    .catch((err) => {
        console.log(`XML の解析に失敗しました: ${err}`);
    });
}

