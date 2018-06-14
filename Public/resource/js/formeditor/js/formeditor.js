define(['jquery', 'zeroclipboard', 'layer', 'laydate', 'ueditor', 'chosen'], function($, Zcl, Layer, laydate) {
	//默认变量
	var variables = {
		//iframe的 document dom对象
		ueIframeDoc: "",
		//Ueditor对象
		editorUE: "",
		//生成表单元素的数量
		formIdx: 0
	}

	//返回变量
	var formeditor = {
		init: function(ueditorId) {
			//绑定ue
			//ueditor需要
			window.ZeroClipboard = Zcl;
			//ueditor初始化
			variables.editorUE = UE.getEditor(ueditorId);
			//ueditorId 
			variables.editorUE.ready(function() {
				variables.ueIframeDoc = document.getElementById('ueditor_0').contentWindow.document;
			});
			//绑定方法
			formeditor.api = api;
		}
	}

	//公用方法
	var api = {
		//添加表单
		addform: function(options) {
			var defaults = {
				label: "表单编辑器",
				//添加的form提交url
				addurl: "",
				//编辑的form提交url
				editorurl: "",
				method: "post"
			}
			$.extend(defaults, options);
			variables.editorUE.ready(function() {
				//ue内容置空
				variables.editorUE.setContent('');
				//添加内容
				variables.editorUE.execCommand('insertHtml', html.addform(defaults));
			});
		},
		//编辑表单
		editorform: function(options) {
			var defaults = {
				label: "",
				//添加的form提交url
				addurl: "",
				//编辑的form提交url
				editorurl: "",
				method: ""
			}
			/*.form-content .title*/
			$uedoc = $(variables.ueIframeDoc);
			if(defaults.label) {
				$uedoc.find(".form-content .title").text(defaults.label);
			}
			if(defaults.addurl) {
				$uedoc.find(".form-content form").attr("data-addurl", defaults.addurl);
			}
			if(defaults.editorurl) {
				$uedoc.find(".form-content form").attr("data-editorurl", defaults.editorurl);
			}
			if(defaults.method) {
				$uedoc.find(".form-content form").attr("method", defaults.method);
			}
		},
		//获取表单
		getform: function() {
			//获取ue中的内容
			//是否要经过处理
			//顺便删除占位字符
			var formhtml = variables.editorUE.getContent();
			if(formhtml) {
				return formhtml;
			} else {
				return "";
			}
		},
		loadingform: function(formhtml) {
			//通过html加载表单
			variables.editorUE.ready(function() {
				//ue内容置空
				variables.editorUE.setContent('');
				//添加内容
				variables.editorUE.execCommand('insertHtml', formhtml);
				//计算id
				ids = [];
				$(".form-section").each(function() {
					ids.push($(this).attr("id").split("-")[1]);
				});
				if(ids.length > 0) {
					maxid = ids[0];
					for(var i = 1; i < ids.length; i++) {
						maxid = ids[i] > maxid ? ids[i] : maxid;
					}
				}
				if(maxid) {
					variables.formIdx = maxid + 1;
				} else {
					variables.formIdx = 1;
				}
			});
		},
		//显示表单
		showform: function(options) {
			var defaults = {
				formhtml: "",
				type: "add", //editor
				jquery_doc: $("body"),
				//编辑初始化数据
				initdata: {}
			}
			$.extend(defaults, options);

			$doc = defaults.jquery_doc;
			$doc.html(defaults.formhtml);

			//提交url改变
			var actionurl = "";
			if(defaults.type == "editor") {
				actionurl = $doc.find("form").attr("data-editorurl");
			} else {
				//默认为添加
				actionurl = $doc.find("form").attr("data-addurl");
			}
			$doc.find("form").attr("action", actionurl);

			//去除提示
			$("#editor-tip").remove();

			//改变按钮
			$doc.find(".form-line .btn-cancel").attr("type", "reset");
			$doc.find(".form-line .btn-primary").attr("type", "submit");

			//改变所有name值
			$('.form-section').each(function() {
				var ipt = $(this).find('input');
				var txtarea = $(this).find('textarea');
				var set = $(this).find('select');
				if(ipt.length > 0) {
					ipt.attr("name", ipt.attr("data-name"));
				}
				if(txtarea.length > 0) {
					txtarea.attr("name", txtarea.attr("data-name"));
				}
				if(set.length > 0) {
					set.attr("name", set.attr("data-name"));
				}

			});

			//select绑定事件
			$doc.find(".chosen").chosen();

			//radio绑定事件
			$doc.find(".form-radio").each(function() {
				$raido_box = $(this);
				$raido_box.find(".radio-box").bind("click", function() {
					//如果不是不能点击
					if($(this).attr("class").indexOf("nocheck") == -1) {
						/*checked*/
						if($(this).attr("class").indexOf("checked") == -1) {
							$raido_box.find(".radio-box").removeClass("checked");
							$raido_box.find(".radio-box").prop("checked", false);
							$(this).addClass("checked");
							var val = $(this).attr("data-value");
							//改变radio选项
							$raido_box.prev().find("input").each(function() {
								$(this).prop("checked", false);
								if($(this).val() == val) {
									$(this).prop("checked", "checked");
								}
							});
						}
					}
				});
			});

			//checkedbox
			$doc.find(".form-checkbox").each(function() {
				$check_box = $(this);
				//默认选中
				$check_box.find(".checkbox-box").each(function() {
					if($(this).attr("class").indexOf("checked") != -1) {
						var val = $(this).attr("data-value");
						$check_box.prev().find("input[value='" + val + "']").prop("checked", true)
					}
				});

				$check_box.find(".checkbox-box").bind("click", function() {
					if($(this).attr("class").indexOf("nocheck") == -1) {
						if($(this).attr("class").indexOf("checked") == -1) {
							//点击
							$(this).addClass("checked");
							var val = $(this).attr("data-value");
							//改变checkbox选项
							$check_box.prev().find("input").each(function() {
								if($(this).val() == val) {
									$(this).prop("checked", true);
								}
							});
						} else {
							//取消
							$(this).removeClass("checked");
							var val = $(this).attr("data-value");
							//改变checkbox选项
							$check_box.prev().find("input").each(function() {
								if($(this).val() == val) {
									$(this).prop("checked", false);
								}
							});
						}
					}
				});
			});

			//时间绑定
			$doc.find(".form-section[data-formtype='date']").each(function() {
				var $dataipt = $(this).find("input").eq(0);
				var extend = {};
				extend.elem = $dataipt[0];
				if($dataipt.attr('data-extype')) {
					extend.type = $dataipt.attr('data-extype');
				}
				if($dataipt.attr('data-exmin')) {
					if($dataipt.attr('data-exmin').indexOf("-") != -1) {
						extend.min = $dataipt.attr('data-exmin');
					} else {
						extend.min = parseInt($dataipt.attr('data-exmin'));
					}
				}
				if($dataipt.attr('data-exmax')) {
					if($dataipt.attr('data-exmax').indexOf("-") != -1) {
						extend.max = $dataipt.attr('data-exmax');
					} else {
						extend.max = parseInt($dataipt.attr('data-exmax'));
					}
				}
				laydate.render(extend);
			});

			//绑定验证方法
			$doc.find("input").each(function() {
				if($(this).attr("data-validate")) {
					$(this).bind("change", function() {
						try {
							var reg = eval($(this).attr("data-validate"));
						} catch(e) {
							Layer.alert("创建表单正则表达式格式输入错误");
						}
						if(!reg.test($(this).val())) {
							$(this).removeClass("normal");
							$(this).addClass("error");
							$prompt = $(this).parent().find(".prompt");
							$prompt.text($prompt.attr("data-error"));
						} else {
							$(this).removeClass("error");
							$(this).addClass("normal");
							$prompt = $(this).parent().find(".prompt");
							$prompt.text("");
						}
					});
				}
			});

			//绑定提交方法
			$doc.find("form").submit(function() {
				var importflag = true;
				//绑定import验证方法
				$doc.find(".import").each(function() {
					var formtype = $(this).parent().attr('data-formtype');
					var val;
					if(formtype == 'radio' || formtype == 'checkbox') {
						var formname = $(this).next().find("input").eq(0).attr("name");
						val = $("input[name='" + formname + "']:checked").val();
					} else {
						val = $(this).next().val();
					}

					if(!val) {
						importflag = false;
						return;
					}
				});

				if(!importflag) {
					Layer.alert("请将必填数据填写完整");
					return false;
				}

				//验证数据
				/*data-validate*/
				var valudateflag = true;
				$doc.find("input").each(function() {
					if($(this).attr("data-validate")) {
						if($(this).val()) {
							var reg = eval($(this).attr("data-validate"));
							if(!reg.test($(this).val())) {
								$(this).removeClass("normal");
								$(this).addClass("error");
								$prompt = $(this).parent().find(".prompt");
								$prompt.text($prompt.attr("data-error"));
								valudateflag = false;
								return;
							}
						}
					}
				});

				if(!valudateflag) {
					return false;
					Layer.alert("表单验证错误");
				} else {
					return true;
				}

			});

			//编辑条件下的init
			if(defaults.type == "editor") {
				for(var i in defaults.initdata) {
					var selector = $doc.find("[name='" + i + "']")
					if(selector.length > 0) {
						var tag = selector;
						var tagname = selector.eq(0).prop("tagName");
						//不同的数据不同的处理
						//TEXTAREA
						if(tagname == "TEXTAREA") {
							tag.val(defaults.initdata[i]);
						}
						//SELECT
						if(tagname == "SELECT") {
							tag.val(defaults.initdata[i]);
							if(tag.attr("class").indexOf("chosen") != -1) {
								tag.trigger("chosen:updated");
							}
						}
						//INPUT type=file radio checkbox
						if(tagname == "INPUT") {
							if(tag.attr("type") == "file") {
								//文件无法赋值
							} else if(tag.attr("type") == "checkbox") {
								//复选框
								if(Object.prototype.toString.call(defaults.initdata[i]) == '[object Array]') {
									tag.each(function() {
										$(this).prop("checked", false);
										if(defaults.initdata[i].indexOf($(this).val()) != -1) {
											$(this).prop("checked", "checked");
										}
									});
									tag.eq(0).parent().next().find(".checkbox-box").each(function() {
										$(this).removeClass("checked");
										if(defaults.initdata[i].indexOf($(this).attr("data-value")) != -1) {
											$(this).addClass("checked");
										}
									});
								}
							} else if(tag.attr("type") == "radio") {
								//单选框
								tag.each(function() {
									$(this).prop("checked", false);
									if($(this).val() == defaults.initdata[i]) {
										$(this).prop("checked", "checked");
									}
								});
								//样式也要改
								tag.eq(0).parent().next().find(".radio-box").each(function() {
									$(this).removeClass("checked");
									if($(this).attr("data-value") == defaults.initdata[i]) {
										$(this).addClass("checked");
									}
								});
							} else {
								//文本 密码 单选 number email
								tag.val(defaults.initdata[i]);
							}
						}

					}
				}
			}

		},
		createform: function(formhtml) {
			//创建表单的html模板
			//编辑
			//添加

			//隐藏的区域
			$("body").append("<div id='createform-div' style='display:none;'></div>");
			$doc = $("#createform-div");
			$doc.html(formhtml);

			//去除提示
			$("#editor-tip").remove();

			//改变按钮
			$doc.find(".form-line .btn-cancel").attr("type", "reset");
			$doc.find(".form-line .btn-primary").attr("type", "submit");

			//改变所有name值
			$('.form-section').each(function() {
				var ipt = $(this).find('input');
				var txtarea = $(this).find('textarea');
				var set = $(this).find('select');
				if(ipt.length > 0) {
					ipt.attr("name", ipt.attr("data-name"));
				}
				if(txtarea.length > 0) {
					txtarea.attr("name", txtarea.attr("data-name"));
				}
				if(set.length > 0) {
					set.attr("name", set.attr("data-name"));
				}
			});

			//javascript字符串
			var javascriptstr = 'var $doc = $("#createform-div");' + "\r\n" +
				//Layer用普通方式加载
				'var Layer = layer;' + "\r\n" +
				//select初始化
				'$doc.find(".chosen").chosen();' + "\r\n" +
				//radio初始化
				'$doc.find(".form-radio").each(function() {' + "\r\n" +
				'$raido_box = $(this);' + "\r\n" +
				'$raido_box.find(".radio-box").bind("click", function() {' + "\r\n" +
				//如果不是不能点击
				'if($(this).attr("class").indexOf("nocheck") == -1) {' + "\r\n" +
				/*checked*/
				'if($(this).attr("class").indexOf("checked") == -1) {' + "\r\n" +
				'$raido_box.find(".radio-box").removeClass("checked");' + "\r\n" +
				'$raido_box.find(".radio-box").prop("checked", false);' + "\r\n" +
				'$(this).addClass("checked");' + "\r\n" +
				'var val = $(this).attr("data-value");' + "\r\n" +
				//改变radio选项
				'$raido_box.prev().find("input").each(function() {' + "\r\n" +
				'$(this).prop("checked", false);' + "\r\n" +
				'if($(this).val() == val) {' + "\r\n" +
				'$(this).prop("checked", "checked");' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'}' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'});' + "\r\n" +
				//checkbox
				'$doc.find(".form-checkbox").each(function() {' + "\r\n" +
				'$check_box = $(this);' + "\r\n" +
				//默认选中
				'$check_box.find(".checkbox-box").each(function() {' + "\r\n" +
				'if($(this).attr("class").indexOf("checked") != -1) {' + "\r\n" +
				'var val = $(this).attr("data-value");' + "\r\n" +
				'$check_box.prev().find("input[value=\'" + val + "\']").prop("checked", true);' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'$check_box.find(".checkbox-box").bind("click", function() {' + "\r\n" +
				'if($(this).attr("class").indexOf("nocheck") == -1) {' + "\r\n" +
				'if($(this).attr("class").indexOf("checked") == -1) {' + "\r\n" +
				//点击
				'$(this).addClass("checked");' + "\r\n" +
				'var val = $(this).attr("data-value");' + "\r\n" +
				//改变checkbox选项
				'$check_box.prev().find("input").each(function() {' + "\r\n" +
				'if($(this).val() == val) {' + "\r\n" +
				'$(this).prop("checked", true);' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'} else {' + "\r\n" +
				//取消
				'$(this).removeClass("checked");' + "\r\n" +
				'var val = $(this).attr("data-value");' + "\r\n" +
				//改变checkbox选项
				'$check_box.prev().find("input").each(function() {' + "\r\n" +
				'if($(this).val() == val) {' + "\r\n" +
				'$(this).prop("checked", false);' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'}' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'});' + "\r\n" +
				//时间绑定
				'$doc.find(".form-section[data-formtype=\'date\']").each(function() {' + "\r\n" +
				'var $dataipt = $(this).find("input").eq(0);' + "\r\n" +
				'var extend = {};' + "\r\n" +
				'extend.elem = $dataipt[0];' + "\r\n" +
				'if($dataipt.attr(\'data-extype\')) {' + "\r\n" +
				'extend.type = $dataipt.attr(\'data-extype\');' + "\r\n" +
				'}' + "\r\n" +
				'if($dataipt.attr(\'data-exmin\')) {' + "\r\n" +
				'if($dataipt.attr(\'data-exmin\').indexOf("-") != -1) {' + "\r\n" +
				'extend.min = $dataipt.attr(\'data-exmin\');' + "\r\n" +
				'} else {' + "\r\n" +
				'extend.min = parseInt($dataipt.attr(\'data-exmin\'));' + "\r\n" +
				'}' + "\r\n" +
				'}' + "\r\n" +
				'if($dataipt.attr(\'data-exmax\')) {' + "\r\n" +
				'if($dataipt.attr(\'data-exmax\').indexOf("-") != -1){' + "\r\n" +
				'extend.max = $dataipt.attr(\'data-exmax\');' + "\r\n" +
				'} else {' + "\r\n" +
				'extend.max = parseInt($dataipt.attr(\'data-exmax\'));' + "\r\n" +
				'}' + "\r\n" +
				'}' + "\r\n" +
				'laydate.render(extend);' + "\r\n" +
				'});' + "\r\n" +
				//绑定验证方法
				'$doc.find("input").each(function() {' + "\r\n" +
				'if($(this).attr("data-validate")) {' + "\r\n" +
				'$(this).bind("change", function() {' + "\r\n" +
				'try {' + "\r\n" +
				'var reg = eval($(this).attr("data-validate"));' + "\r\n" +
				'} catch(e) {' + "\r\n" +
				'Layer.alert("创建表单正则表达式格式输入错误");' + "\r\n" +
				'}' + "\r\n" +
				'if(!reg.test($(this).val())) {' + "\r\n" +
				'$(this).removeClass("normal");' + "\r\n" +
				'$(this).addClass("error");' + "\r\n" +
				'$prompt = $(this).parent().find(".prompt");' + "\r\n" +
				'$prompt.text($prompt.attr("data-error"));' + "\r\n" +
				'} else {' + "\r\n" +
				'$(this).removeClass("error");' + "\r\n" +
				'$(this).addClass("normal");' + "\r\n" +
				'$prompt = $(this).parent().find(".prompt");' + "\r\n" +
				'$prompt.text("");' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				//绑定提交方法
				'$doc.find("form").submit(function() {' + "\r\n" +
				'var importflag = true;' + "\r\n" +
				'$doc.find(".import").each(function() {' + "\r\n" +
				'var formtype = $(this).parent().attr(\'data-formtype\');' + "\r\n" +
				'var val;' + "\r\n" +
				'if( formtype== \'radio\' || formtype == \'checkbox\') {' + "\r\n" +
				'var formname = $(this).next().find("input").eq(0).attr("name");' + "\r\n" +
				'val = $("input[name=\'"+formname+"\']:checked").val();' + "\r\n" +
				'} else {' + "\r\n" +
				'val = $(this).next().val();' + "\r\n" +
				'}' + "\r\n" +
				'if(!val) {' + "\r\n" +
				'importflag = false;' + "\r\n" +
				'return;' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'if(!importflag) {' + "\r\n" +
				'Layer.alert("请将必填数据填写完整");' + "\r\n" +
				'return false;' + "\r\n" +
				'}' + "\r\n" +
				//验证数据
				/*data-validate*/
				'var valudateflag = true;' + "\r\n" +
				'$doc.find("input").each(function() {' + "\r\n" +
				'if($(this).attr("data-validate")) {' + "\r\n" +
				'if($(this).val()) {' + "\r\n" +
				'var reg = eval($(this).attr("data-validate"));' + "\r\n" +
				'if(!reg.test($(this).val())) {' + "\r\n" +
				'$(this).removeClass("normal");' + "\r\n" +
				'$(this).addClass("error");' + "\r\n" +
				'$prompt = $(this).parent().find(".prompt");' + "\r\n" +
				'$prompt.text($prompt.attr("data-error"));' + "\r\n" +
				'valudateflag = false;' + "\r\n" +
				'return;' + "\r\n" +
				'}' + "\r\n" +
				'}' + "\r\n" +
				'}' + "\r\n" +
				'});' + "\r\n" +
				'if(!valudateflag) {' + "\r\n" +
				'return false;' + "\r\n" +
				'Layer.alert("表单验证错误");' + "\r\n" +
				'} else {' + "\r\n" +
				'return true;' + "\r\n" +
				'}' + "\r\n" +
				'});'

			//add 和 editor
			var createhtml = {
				addhtml: '',
				editorhtml: ''
			}

			actionurl = $doc.find("form").attr("data-editorurl");
			if(actionurl) {
				$doc.find("form").attr("action", actionurl);
				createhtml.editorhtml = '<div id="createform-div">' + $doc.html() + '</div>' + '<script type="text/javascript">\r\n' + javascriptstr + '\r\n</script>';
			}

			actionurl = $doc.find("form").attr("data-addurl");
			if(actionurl) {
				$doc.find("form").attr("action", actionurl);
				createhtml.addhtml = '<div id="createform-div">' + $doc.html() + '</div>' +
					'<script type="text/javascript">\r\n' + javascriptstr + '\r\n</script>';
			}

			return createhtml;
		},
		//编辑元素的option
		editor: function(options, type, formId) {
			ipt = variables.ueIframeDoc.getElementById(formId);
			var func = 'html.add' + type + "(options);";
			content = eval(func);
			$(ipt).after(content);
			$(ipt).remove();
			variables.formIdx++;
		},
		delete: function(formId) {
			ipt = variables.ueIframeDoc.getElementById(formId);
			$(ipt).remove();
		},
		//添加text
		addtext: function(options) {
			options = options ? options : {};
			var defaults = {
				name: "",
				label: "表单",
				size: 12,
				label_size: 2,
				ipt_size: 9,
				prompt: "提示",
				errortip: "错误",
				validate: "",
				ipt_import: "",
				value: "",
				type: "text"
			};
			$.extend(defaults, options);
			//正则表达式替换
			if(defaults.validate) {
				var validateRs = func.validateReplace(defaults.validate);
				if(validateRs) {
					defaults.validate = validateRs;
				} else {
					Layer.alert("验证规则不是内置值也不是正则表达式");
					return false;
				}
			}
			variables.editorUE.ready(function() {
				variables.editorUE.execCommand('insertHtml', html.addtext(defaults));
				variables.formIdx++;
			});
		},
		adddate: function(options) {
			options = options ? options : {};
			var defaults = {
				name: "",
				label: "时间",
				size: 12,
				label_size: 2,
				ipt_size: 9,
				prompt: "提示",
				errortip: "错误",
				validate: "",
				ipt_import: "",
				value: "",
				extend: {
					//时间格式 默认为2017-06-01这种
					type: '', //year month time datetime
					min: '', //最小 日期 如2018-06-01   填写-7 可以表示前后可选多天 type为默认时可选
					max: ""
					/*format:'' //格式 默认为 yyyy-MM-dd*/
				}
			};
			$.extend(defaults, options);
			variables.editorUE.ready(function() {
				variables.editorUE.execCommand('insertHtml', html.adddate(defaults));
				variables.formIdx++;
			});

		},
		addtextarea: function(options) {
			options = options ? options : {};
			var defaults = {
				name: "",
				label: "文本域",
				size: 12,
				label_size: 2,
				ipt_size: 9,
				prompt: "提示",
				errortip: "错误",
				validate: "",
				ipt_import: "",
				value: ""
			};
			$.extend(defaults, options);
			variables.editorUE.ready(function() {
				variables.editorUE.execCommand('insertHtml', html.addtextarea(defaults));
				variables.formIdx++;
			});
		},
		addselect: function(options) {
			options = options ? options : {};
			var defaults = {
				name: "",
				label: "选择框",
				size: 12,
				label_size: 2,
				ipt_size: 9,
				ipt_import: "import",
				childs: [{
					value: 1,
					txt: '默认选项1'
				}, {
					value: 2,
					txt: '默认选项2'
				}, {
					value: 3,
					txt: '默认选项3'
				}],
				type: "normal" //normal chosen-1 chosen-2
			};
			$.extend(defaults, options);
			variables.editorUE.ready(function() {
				variables.editorUE.execCommand('insertHtml', html.addselect(defaults));
				variables.formIdx++;
			});
		},
		addradio: function(options) {
			options = options ? options : {};
			var defaults = {
				name: "",
				label: "单选框",
				size: 12,
				label_size: 2,
				ipt_size: 9,
				ipt_import: "import",
				childs: [{
					value: 1,
					txt: '默认选项1',
					check: "checked"
				}, {
					value: 2,
					txt: '默认选项2',
					check: "nocheck"
				}, {
					value: 3,
					txt: '默认选项3',
					check: ""
				}]
			};
			$.extend(defaults, options);
			variables.editorUE.ready(function() {
				variables.editorUE.execCommand('insertHtml', html.addradio(defaults));
				variables.formIdx++;
			});
		},
		addcheckbox: function(options) {
			options = options ? options : {};
			var defaults = {
				name: "",
				label: "复选框",
				size: 12,
				label_size: 2,
				ipt_size: 9,
				ipt_import: "import",
				childs: [{
					value: 1,
					txt: '默认选项1',
					check: "checked"
				}, {
					value: 2,
					txt: '默认选项2',
					check: "nocheck"
				}, {
					value: 3,
					txt: '默认选项3',
					check: ""
				}, {
					value: 4,
					txt: '默认选项4',
					check: "checked"
				}]
			};
			$.extend(defaults, options);
			variables.editorUE.ready(function() {
				variables.editorUE.execCommand('insertHtml', html.addcheckbox(defaults));
				variables.formIdx++;
			});
		},
		addfile: function(options) {
			options = options ? options : {};
			var defaults = {
				name: "",
				label: "文件",
				size: 12,
				label_size: 2,
				ipt_size: 9,
				accept: "all", //image
				multiple: "", //multiple 
				ipt_import: ""
			};
			$.extend(defaults, options);
			variables.editorUE.ready(function() {
				variables.editorUE.execCommand('insertHtml', html.addfile(defaults));
				variables.formIdx++;
			});
		}
	}

	//私有方法
	var func = {
		//默认验证规则替换 以及提示
		validateReplace: function(str) {
			/*email、tel(手机)、idcard(身份证)、chinese、number、english、url*/
			switch(str) {
				case "email":
					return '/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/';
					break;
				case "tel":
					return '/^[1][3,4,5,7,8][0-9]{9}$/';
					break;
				case "idcard":
					return '/^[1-9]([0-9]{16}|[0-9]{13})[xX0-9]$/';
					break;
				case "url":
					return '/^([hH][tT]{2}[pP]:\\/\\/|[hH][tT]{2}[pP][sS]:\\/\\/)(([A-Za-z0-9-~]+)\\.)+([A-Za-z0-9-~\\/])+$/';
					break;
				case "chinese":
					return '/^[\\u4e00-\\u9fa5]{0,}$/';
					break;
				case "number":
					return '/^[0-9]*$/';
					break;
				case "english":
					return '/^[a-zA-Z]+$/';
					break;
				default:
					//判断是否为正则表达式
					var regExp = /^\/\^\w+\$\/$/;
					if(regExp.test(str)) {
						return str;
					} else {
						return false;
					}
			}
		}

	}

	//生成html模板
	var html = {
		addform: function(options) {
			return '<div class="form-editor">' +
				'<div class="form-content">' +
				'<div class="title">' + options.label +
				'</div>' +
				'<form action="" data-addurl="' + options.addurl + '" data-editorurl="' + options.editorurl + '"  id="editor-form" method="' + options.method + '">' +
				'<p id="editor-tip" style="color:#999;">（占位字符,表单编辑完成后会自动删除,请在此括号前插入表单）</p>' +
				'<div class="form-line text-right">' +
				'<button type="button" class="btn btn-cancel" data-type="reset"><i class="fa fa-refresh"></i>&nbsp;重置</button>' +
				'<button type="button" class="btn btn-primary" data-type="submit"><i class="fa fa-save"></i>&nbsp;保存</button>' +
				'</div>' +
				'</form>' +
				'</div>' +
				'</div>	'
		},
		addtext: function(options) {
			var opstr = JSON.stringify(options);
			var dateipt = "";
			if(options.type == "date") {
				options.type = "text";
				dateipt = "dateipt";
			}
			return '<div data-formtype="text" class="form-section form-size-' + options.size + '" id="formeditor-' + variables.formIdx + '">' +
				'<div class="display-none data-options">' + opstr + '</div>' +
				'<label class="form-size-' + options.label_size + ' ' + options.ipt_import + ' text-right">' + options.label + '</label>' +
				'<input data-name="' + options.name + '" type="' + options.type + '" class="form-size-' + options.ipt_size + ' normal ' + dateipt + '" data-validate="' + options.validate + '" name=""  value="' + options.value + '" />' +
				'<span class="form-size-' + options.label_size + '"></span><span data-error="' + options.errortip + '" class="prompt form-size-' + options.ipt_size + '">' + options.prompt + '</span>' +
				'</div>'
		},
		adddate: function(options) {
			var opstr = JSON.stringify(options);
			return '<div data-formtype="date" class="form-section form-size-' + options.size + '" id="formeditor-' + variables.formIdx + '">' +
				'<div class="display-none data-options">' + opstr + '</div>' +
				'<label class="form-size-' + options.label_size + ' ' + options.ipt_import + ' text-right">' + options.label + '</label>' +
				'<input data-name="' + options.name + '" type="text" class="form-size-' + options.ipt_size + ' normal" data-extype="' + options.extend.type + '" data-exmin="' + options.extend.min + '" data-exmax="' + options.extend.max + '" data-exformat="' + options.extend.format + '" data-validate="' + options.validate + '" name=""  value="' + options.value + '" />' +
				'<span class="form-size-' + options.label_size + '"></span><span data-error="' + options.errortip + '" class="prompt form-size-' + options.ipt_size + '">' + options.prompt + '</span>' +
				'</div>'
		},
		addtextarea: function(options) {
			var opstr = JSON.stringify(options);
			return '<div data-formtype="textarea" class="form-section form-size-' + options.size + '" id="formeditor-' + variables.formIdx + '">' +
				'<div class="display-none data-options">' + opstr + '</div>' +
				'<label class="form-size-' + options.label_size + ' text-right ' + options.ipt_import + '">' + options.label + '</label>' +
				'<textarea data-name="' + options.name + '" class="form-size-' + options.ipt_size + ' normal" data-validate="' + options.validate + '" name="" rows="" cols="" value="' + options.value + '"></textarea>' +
				'<span class="form-size-' + options.label_size + '"></span><span data-error="' + options.errortip + '" class="prompt form-size-' + options.ipt_size + '">' + options.prompt + '</span>' +
				'</div>'
		},
		addselect: function(options) {
			var opstr = JSON.stringify(options);
			var childs = '';
			for(var i in options.childs) {
				childs += '<option value="' + options.childs[i].value + '">' + options.childs[i].txt + '</option>';
			}

			var multiple = '';
			var chosen = '';
			if(options.type == "chosen-1") {
				chosen = "chosen";
			} else if(options.type == "chosen-2") {
				chosen = "chosen";
				multiple = "multiple";
			}

			return '<div data-formtype="select" class="form-section form-size-' + options.size + '" id="formeditor-' + variables.formIdx + '">' +
				'<div class="display-none data-options">' + opstr + '</div>' +
				'<label class="form-size-' + options.label_size + ' text-right ' + options.ipt_import + '">' + options.label + '</label>' +
				'<select data-name="' + options.name + '" class="form-size-' + options.ipt_size + ' normal ' + chosen + '" ' + multiple + '>' +
				childs +
				'</select>' +
				'</div>'
		},
		addradio: function(options) {
			var opstr = JSON.stringify(options);
			var radiostr = '';
			var radioboxstr = '';
			for(var i in options.childs) {
				radiostr += '<input type="radio" data-name="' + options.name + '" ' + options.childs[i].check + ' value="' + options.childs[i].value + '" /><span>' + options.childs[i].txt + '</span>';
				radioboxstr += '<div class="radio-box ' + options.childs[i].check + '" data-value="' + options.childs[i].value + '">' +
					'<div class="radio-square"></div>' +
					'<div class="radio-txt">' + options.childs[i].txt + '</div>' +
					'</div>';
			}

			return '<div data-formtype="radio" class="form-section form-size-' + options.size + '" id="formeditor-' + variables.formIdx + '">' +
				'<div class="display-none data-options">' + opstr + '</div>' +
				'<label class="form-size-' + options.label_size + ' text-right ' + options.ipt_import + '">' + options.label + '</label>' +
				'<div style="display: none;">' +
				radiostr +
				'</div>' +
				'<div class="form-radio form-size-' + options.ipt_size + '" data-name="' + options.name + '">' +
				radioboxstr +
				'</div>' +
				'</div>'
		},
		addcheckbox: function(options) {
			var opstr = JSON.stringify(options);
			var checkstr = '';
			var checkboxstr = '';
			for(var i in options.childs) {
				checkstr += '<input type="checkbox" data-name="' + options.name + '[]" value="' + options.childs[i].value + '" /><span>' + options.childs[i].txt + '</span>';
				checkboxstr += '<div class="checkbox-box ' + options.childs[i].check + '" data-value="' + options.childs[i].value + '">' +
					'<div class="checkbox-square"></div>' +
					'<div class="checkbox-txt">' + options.childs[i].txt + '</div>' +
					'</div>'
			}

			return '<div data-formtype="checkbox" class="form-section form-size-' + options.size + '" id="formeditor-' + variables.formIdx + '">' +
				'<div class="display-none data-options">' + opstr + '</div>' +
				'<label class="form-size-' + options.label_size + ' text-right ' + options.ipt_import + '">' + options.label + '</label>' +
				'<div style="display: none;">' +
				checkstr +
				'</div>' +
				'<div class="form-checkbox form-size-' + options.ipt_size + '" data-name="' + options.name + '">' +
				checkboxstr +
				'</div>' +
				'</div>'
		},
		addfile: function(options) {
			var opstr = JSON.stringify(options);
			var accept = "";
			if(options.accept == "image") {
				accept = "accept='image/gif,image/jpeg,image/jpg,image/png'";
			}
			var multiple = "";
			if(options.multiple == "multiple") {
				multiple = "multiple='multiple'";
			}

			return '<div data-formtype="file" class="form-section form-size-' + options.size + '" id="formeditor-' + variables.formIdx + '">' +
				'<div class="display-none data-options">' + opstr + '</div>' +
				'<label class="form-size-' + options.label_size + ' text-right ' + options.ipt_import + '">' + options.label + '</label>' +
				'<input type="file" class="form-size-' + options.ipt_size + ' form-file" ' + multiple + ' ' + accept + ' data-name="' + options.name + '" value="" />'
			'</div>'
		}
	}

	return formeditor;
});