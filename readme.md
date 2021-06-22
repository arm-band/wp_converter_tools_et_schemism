# WP Converter Tools-et Schemism

## Abstract

WordPress の Toolset Types (ver 2.2.23) のカスタムタクソノミー1つの定義を Custom Post Type UI (ver 1.9.1) のカスタムタクソノミー1つの定義に変換するスニペット

## Usage

1. `settings.xml` の準備
    - Toolset Types の「Export / Import」 から「Typesデータをエクスポート」で `settings.xml` をダウンロード
    - スニペット用にファイル作成 (後述の Prepare 参照)
    - `src/`内 に配置
2. `yarn`
3. `yarn start post` (カスタム投稿タイプの場合) or `yarn start tax` (カスタム投稿タイプの場合)
4. CPT UI の「ツール」で「投稿タイプ」または「タクソノミー」で3.で出力された `json` ファイルをペースト、インポート

### Prepare

Toolset Types からエクスポートされた `settings.xml` の加工について。

#### Custom Post Type

カスタム投稿タイプならば以下のフォーマット

```xml
<?xml version="1.0" encoding="UTF-8"?>
<type>
    <!-- 略 -->
</type>
```

- 1行目に `<?xml version="1.0" encoding="UTF-8"?>`
- 2行目以下は各カスタム投稿タイプの単独の定義 (`<type>`～`</type>`) をペースト

を `src/settings.xml` として用意する。

#### Custom Taxonomy

カスタムタクソノミーならば以下のフォーマット

```xml
<?xml version="1.0" encoding="UTF-8"?>
<taxonomy>
    <!-- 略 -->
</taxonomy>
```

- 1行目に `<?xml version="1.0" encoding="UTF-8"?>`
- 2行目以下は各カスタムタクソノミーの単独の定義 (`<taxonomy>`～`</taxonomy>`) をペースト

を `src/settings.xml` として用意する。

## Settings

`settings.json` について。

- `distDir`:
    - description: `json` ファイル出力先ディレクトリ
    - default: `dist`
- `srcDir`:
    - description: `xml` ファイル読み込み元ディレクトリ
    - default: `src`
- `srcFile`:
    - description: 読み込む `xml` ファイル名
    - default: `settings.xml`
- `baseTaxonomyFile`:
    - description: カスタムタクソノミーの出力 `json` ファイルのベースとなるファイル (編集しないこと)
    - default: `base_taxonomy.json`
- `basePostFile`:
    - description: カスタム投稿タイプの出力 `json` ファイルのベースとなるファイル (編集しないこと)
    - default: `base_post.json`
- `distTaxonomyFile`:
    - description: カスタムタクソノミーの出力 `json` ファイル名
    - default: `output_taxonomy.json"`
- `distPostFile`:
    - description: カスタム投稿タイプの出力 `json` ファイル名
    - default: `output_post.json`