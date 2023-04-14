<?php
/**
 * Functions
 */

/**
 * WordPress標準機能
 */
/**
 * カスタムテーマ機能設定
 */
function my_setup() {
    // アイキャッチ画像、RSSフィード、タイトルタグのサポート
    add_theme_support('post-thumbnails', 'automatic-feed-links', 'title-tag');

    // HTML5タグでの出力サポート
    add_theme_support('html5', [
        'search-form', 'comment-form', 'comment-list', 'gallery', 'caption'
    ]);
}

// テーマ設定を初期化
add_action('after_setup_theme', 'my_setup');




/**
 * CSSとJavaScriptの読み込み
 *
 * @codex https://wpdocs.osdn.jp/%E3%83%8A%E3%83%93%E3%82%B2%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC
 */
function my_script_init()
{

	wp_enqueue_style( 'my', get_template_directory_uri() . '/assets/css/style.css', array(), '1.0.1', 'all' );

	wp_enqueue_script( 'my', get_template_directory_uri() . '/assets/js/script.js', array( 'jquery' ), '1.0.1', true );

}
add_action('wp_enqueue_scripts', 'my_script_init');




/**
 * メニューの登録
 */
function my_menu_init() {
	register_nav_menus(
		array(
			'global'  => 'ヘッダーメニュー',
			'utility' => 'ユーティリティメニュー',
			'drawer'  => 'ドロワーメニュー',
		)
	);
}
add_action( 'init', 'my_menu_init' );


/**
 * ウィジェットの登録
 */
function my_widget_init() {
	register_sidebar(
		array(
			'name'          => 'サイドバー',
			'id'            => 'sidebar',
			'before_widget' => '<div id="%1$s" class="p-widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<div class="p-widget__title">',
			'after_title'   => '</div>',
		)
	);
}
add_action( 'widgets_init', 'my_widget_init' );


/**
 * アーカイブタイトル書き換え
 */
function my_archive_title($title) {
    if (is_home()) {
        $title = 'ブログ';
    } elseif (is_category() || is_tag() || is_post_type_archive() || is_tax()) {
        $title = single_term_title('', false);
    } elseif (is_search()) {
        $title = '「' . esc_html(get_query_var('s')) . '」の検索結果';
    } elseif (is_author()) {
        $title = get_the_author();
    } elseif (is_date()) {
        $title = '';
        if ($year = get_query_var('year')) {
            $title .= $year . '年';
        }
        if ($month = get_query_var('monthnum')) {
            $title .= $month . '月';
        }
        if ($day = get_query_var('day')) {
            $title .= $day . '日';
        }
    }
    return $title;
}
add_filter('get_the_archive_title', 'my_archive_title');



// 抜粋文の文字数を変更する関数
function my_excerpt_length($length) {
    return 80;    // 80文字に設定
}
add_filter('excerpt_length', 'my_excerpt_length', 999); // 'excerpt_length'フィルターに関数を適用

// 抜粋文の省略記法を変更する関数
function my_excerpt_more($more) {
    return '...'; // 省略記法を'...'に変更
}
add_filter('excerpt_more', 'my_excerpt_more'); // 'excerpt_more'フィルターに関数を適用
