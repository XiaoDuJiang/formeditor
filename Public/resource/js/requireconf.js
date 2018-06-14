/*require配置文件*/
require.config({
	urlArgs:'v='+(new Date()).getTime(),//清楚缓存
	baseUrl: '/Public/resource/js/', //资源基础路径
	paths: {
		'jquery': 'jquery-2.1.0',
		'layer': 'formeditor/js/layer/layer',
		'chosen':'formeditor/js/chosen/chosen.jquery',
		'laydate':'formeditor/js/laydate/laydate',
        'ueditor': 'ueditor/ueditor.all',
        'ueditor.config': 'ueditor/ueditor.config',
        'zeroclipboard': 'ueditor/third-party/zeroclipboard/ZeroClipboard.min',

        'formeditor':'formeditor/js/formeditor'
	},
	shim: {
        'layer': {
            deps: [
                'jquery',
                'css!../js/formeditor/js/layer/theme/default/layer.css'
            ]
        },
        'chosen': {
            deps: [
                'jquery',
                'css!../js/formeditor/js/chosen/chosen.css'
            ]
        },
        'laydate': {
            exports: 'laydate',
            deps: [
            'css!../js/formeditor/js/laydate/theme/default/laydate.css'
            ]
        },
        'ueditor': {
        	deps: [
        		'ueditor.config'
			]
		},
		'formeditor':{
			deps: [
				'css!../js/formeditor/css/formeditor.css',
				'css!../js/formeditor/css/font-awesome/css/font-awesome.min.css'
			]
		}
	},
	map: {
		'*': {
			'css': 'require-css/css.min'
		}
	}
});