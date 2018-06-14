require(['formeditor', 'layer'], function(Formeditor, Layer) {
	//表单数据
	formobj = {
		name: "",
		filename: "",
		addurl: "",
		eidtorurl: "",
		method: ""
	};

	//编辑器初始化
	Formeditor.init('formEditor');
	//切换方法初始化
	tabInit();
	//选项有关方法初始化
	childsMethod();
	//初始化add操作
	addInit();
	//操作标志 1添加 2编辑
	var opflag = 0;

	//add操作初始化
	function addInit() {
		//操作的表单id
		var formId = "";
		var formType = "";

		//点击保存使用的方法
		var savefunc = null;
		$("#addtext").bind("click", function() {
			openAddWindow("添加文本框", "model-text");
			savefunc = Formeditor.api.addtext;
			opflag = 1;
		});

		$("#adddate").bind("click", function() {
			openAddWindow("添加时间框", "model-date");
			savefunc = Formeditor.api.adddate;
			opflag = 1;
		});

		$("#addtextarea").bind("click", function() {
			openAddWindow("添加文本域", "model-textarea");
			savefunc = Formeditor.api.addtextarea;
			opflag = 1;
		});

		$("#addSelect").bind("click", function() {
			openAddWindow("添加选择框", "model-select");
			savefunc = Formeditor.api.addselect;
			opflag = 1;
		});

		$("#addRadio").bind("click", function() {
			openAddWindow("添加单选框", "model-radio");
			savefunc = Formeditor.api.addradio;
			opflag = 1;
		});

		$("#addChecked").bind("click", function() {
			openAddWindow("添加复选框", "model-checkbox");
			savefunc = Formeditor.api.addcheckbox;
			opflag = 1;
		});

		$("#addFile").bind("click", function() {
			openAddWindow("添加文件", "model-file");
			savefunc = Formeditor.api.addfile;
			opflag = 1;
		});

		//关闭窗口绑定
		$("body").on("click", ".add-cancel", function() {
			Layer.close(layerWindow);
		});

		//保存绑定
		$("body").on("click", ".add-save", function() {
			if(opflag == 1) {
				//添加
				var $formdiv = $(".layui-layer-content>.form-size-12");
				var formobj = getAddOptions($formdiv);
				if(formobj) {
					if(savefunc(formobj) != false) {
						Layer.close(layerWindow);
					}
				}
			} else if(opflag == 2) {
				//编辑
				var $formdiv = $(".layui-layer-content>.form-size-12");
				var formobj = getAddOptions($formdiv);
				if(formobj) {
					Formeditor.api.editor(formobj, formType, formId);
					Layer.close(layerWindow);
				}
			}
		});

		//组织表单数据方法
		function getAddOptions($formdiv) {
			var formobj = {};
			var isComplete = true;
			$formdiv.find(".import").each(function() {
				var val = $(this).next().val();
				if(!val) {
					isComplete = false;
					return;
				}
			});
			if(!isComplete) {
				Layer.alert("请将必填项填写完整");
				return false;
			}
			//获取表单属性数据
			formobj.name = $formdiv.find('input[name="name"]').val();
			formobj.label = $formdiv.find('input[name="label"]').val();
			formobj.prompt = $formdiv.find('input[name="prompt"]').val();
			formobj.value = $formdiv.find('input[name="value"]').val();
			formobj.validate = $formdiv.find('input[name="validate"]').val();
			formobj.errortip = $formdiv.find('input[name="errortip"]').val();
			formobj.ipt_import = $formdiv.find('select[name="import"]').val();
			formobj.multiple = $formdiv.find('select[name="multiple"]').val();
			formobj.accept = $formdiv.find('select[name="accept"]').val();

			formobj.extend = {};
			formobj.extend.type = $formdiv.find('select[name="extendtype"]').val();
			if(formobj.extend.type && formobj.extend.type == 1) {
				formobj.extend.type = "";
			}

			formobj.extend.min = $formdiv.find('input[name="extendmin"]').val();
			formobj.extend.max = $formdiv.find('input[name="extendmax"]').val();

			if(formobj.multiple && formobj.multiple == 1) {
				formobj.multiple = "";
			}
			if(formobj.ipt_import == 1) {
				formobj.ipt_import = "";
			}

			formobj.size = $formdiv.find('select[name="size"]').val();

			if(formobj.size == 12) {
				formobj.label_size = 2;
				formobj.ipt_size = 9;
			} else if(formobj.size == 6) {
				formobj.label_size = 3;
				formobj.ipt_size = 9;
			}

			formobj.type = $formdiv.find('select[name="type"]').val();

			if(formobj.type == 1) {
				formobj.type = "";
			}
			var childs = [];

			if($formdiv.find(".child-table tr").length > 1) {
				$formdiv.find(".child-table tr").each(function() {
					//组织生成的传入对象数据
					if($(this).find("td")) {
						var child = {};
						child.value = $(this).find("td[data-name='value']").text();
						child.txt = $(this).find("td[data-name='txt']").text();
						child.check = $(this).find("td[data-name='check']").text();
						if(child.value && child.txt) {
							childs.push(child);
						}
					}

				});
				formobj.childs = childs;
			} else if($formdiv.find(".child-table tr").length == 1) {
				if(!$(this).next().val()) {
					Layer.alert("请填写选项");
					return false;
				}
			}
			return formobj;
		}

		//数据写入表单方法
		function OptionsToForm($formdiv, formobj) {
			$formdiv.find('input[name="name"]').val(formobj.name);
			$formdiv.find('input[name="label"]').val(formobj.label);
			$formdiv.find('input[name="prompt"]').val(formobj.prompt);
			$formdiv.find('input[name="value"]').val(formobj.value);
			$formdiv.find('input[name="validate"]').val(formobj.validate);
			$formdiv.find('input[name="errortip"]').val(formobj.errortip);

			if(formobj.extend) {
				if(formobj.extend.type == "") {
					formobj.extend.type = 1;
				}
				$formdiv.find('select[name="extendtype"]').val(formobj.extend.type);
				$formdiv.find('input[name="extendmin"]').val(formobj.extend.min);
				$formdiv.find('input[name="extendmax"]').val(formobj.extend.max);
			}

			/*select*/
			if(formobj.ipt_import == "") {
				formobj.ipt_import = 1;
			}
			$formdiv.find('select[name="import"]').val(formobj.ipt_import);

			if(formobj.multiple == "") {
				formobj.multiple = 1;
			}
			$formdiv.find('select[name="multiple"]').val(formobj.multiple);

			if(formobj.accept == "") {
				formobj.accept = 1;
			}
			$formdiv.find('select[name="accept"]').val(formobj.accept);

			if(formobj.size == "") {
				formobj.size = 1;
			}
			$formdiv.find('select[name="size"]').val(formobj.size);

			if($formdiv.type == "") {
				$formdiv.type = 1;
			}
			$formdiv.find('select[name="type"]').val(formobj.type);

			/*table*/
			//$formdiv.find(".child-table").append();
			for(var i in formobj.childs) {
				var tablehtml = "";
				if($formdiv.find(".child-table tr th").length == 4) {
					tablehtml += '<tr><td data-name="value" style="width: 25%;">' + formobj.childs[i].value + '</td>' +
						'<td data-name="txt" style="width: 25%;">' + formobj.childs[i].txt + '</td>' +
						'<td data-name="check" style="width: 25%;">' + formobj.childs[i].check + '</td>' +
						'<td style="width: 25%;">' +
						'<ul class="form-size-12 padding-top-3" style="font-size: 0;">' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-delete">删除</a>' +
						'</li>' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-up">上移</a>' +
						'</li>' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-down">下移</a>' +
						'</li>' +
						'</ul>' +
						'</td>'
				} else if($formdiv.find(".child-table tr th").length == 3) {
					tablehtml = '<tr><td data-name="value" style="width: 33%;">' + formobj.childs[i].value + '</td>' +
						'<td data-name="txt" style="width: 33%;">' + formobj.childs[i].txt + '</td>' +
						'<td style="width: 34%;">' +
						'<ul class="form-size-12 padding-top-3" style="font-size: 0;">' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-delete">删除</a>' +
						'</li>' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-up">上移</a>' +
						'</li>' +
						'<li class="form-size-4 font-md" class="child-down">' +
						'<a href="javascript:void(0);">下移</a>' +
						'</li>' +
						'</ul>' +
						'</td>'
				}

				$formdiv.find(".child-table").append(tablehtml);
			}
		}

		setTimeout(function() {
			//浮动菜单延迟显示(ue加载问题)
			menuInit();
			//表单属性操作初始化
			alertforminit();
		}, 500);

		//浮动菜单
		function menuInit() {
			var $ue = $(document.getElementById('ueditor_0').contentWindow.document);
			$ue.find("body").on("mouseover", ".form-section", function() {
				//显示菜单
				if($(".hover-menu").css("display") == "none") {
					var top = $("#ueditor_0").offset().top + $(this).offset().top + $(this).height();
					var left = $("#ueditor_0").offset().left + $(this).offset().left;
					$(".hover-menu").css({
						top: top,
						left: left
					});
					$(".hover-menu").show();
					formId = $(this).attr("id");
					formType = $(this).attr("data-formtype");
				}
			});
			$ue.find("body").on("mouseleave", ".form-section", function() {
				//隐藏菜单
				if($(".hover-menu").css("display") != "none") {
					$(".hover-menu").hide();
				}
			});
			$(".hover-menu").bind("mouseover", function() {
				$(".hover-menu").show();
			});
			$(".hover-menu").bind("mouseleave", function() {
				$(".hover-menu").hide();
			});

			//点击编辑
			$("#form-editor").bind("click", function() {
				//改变操作类型
				opflag = 2;
				var formobj = eval("(" + $ue.find("#" + formId + " .data-options").text() + ")");
				//根据类型打开窗口
				openAddWindow("编辑", "model-" + formType);
				//赋值
				var formdiv = $(".layui-layer-content>.form-size-12");
				OptionsToForm(formdiv, formobj);
			});

			//点击上移
			$("#form-up").bind("click", function() {
				var contentdiv = $ue.find("#" + formId);
				var content = $ue.find("#" + formId).prop('outerHTML');
				if($ue.find("#" + formId).prev().attr("class") && $ue.find("#" + formId).prev().attr("class").indexOf("form-section") != -1) {
					$ue.find("#" + formId).prev().before(content);
					contentdiv.remove();
					$(".hover-menu").hide();
				}
			});

			//点击下移
			$("#form-down").bind("click", function() {
				var contentdiv = $ue.find("#" + formId);
				var content = $ue.find("#" + formId).prop('outerHTML');
				if($ue.find("#" + formId).next().attr("class") && $ue.find("#" + formId).next().attr("class").indexOf("form-section") != -1) {
					$ue.find("#" + formId).next().after(content);
					contentdiv.remove();
					$(".hover-menu").hide();
				}
			});

			//点击删除
			$("#form-delete").bind("click", function() {
				$ue.find("#" + formId).remove();
				$(".hover-menu").hide();
			});
		}

	}

	//选项有关方法绑定 childs
	function childsMethod() {
		//添加方法
		$("body").on("click", ".add-childs", function() {
			var $ipt_form = $(this).parent().parent();
			var $ipt_table = $ipt_form.next().find(".child-table");
			var value = $ipt_form.find(".child-value").val();
			var txt = $ipt_form.find(".child-text").val();
			var check = $ipt_form.find(".child-check").val() == 1 ? "" : $ipt_form.find(".child-check").val();
			if(value && txt) {
				var tablehtml = '';
				if($ipt_table.find("tr th").length == 4) {
					tablehtml += '<tr><td data-name="value" style="width: 25%;">' + value + '</td>' +
						'<td data-name="txt" style="width: 25%;">' + txt + '</td>' +
						'<td data-name="check" style="width: 25%;">' + check + '</td>' +
						'<td style="width: 25%;">' +
						'<ul class="form-size-12 padding-top-3" style="font-size: 0;">' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-delete">删除</a>' +
						'</li>' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-up">上移</a>' +
						'</li>' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-down">下移</a>' +
						'</li>' +
						'</ul>' +
						'</td>'
				} else if($ipt_table.find("tr th").length == 3) {
					tablehtml = '<tr><td data-name="value" style="width: 33%;">' + value + '</td>' +
						'<td data-name="txt" style="width: 33%;">' + txt + '</td>' +
						'<td style="width: 34%;">' +
						'<ul class="form-size-12 padding-top-3" style="font-size: 0;">' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-delete">删除</a>' +
						'</li>' +
						'<li class="form-size-4 font-md">' +
						'<a href="javascript:void(0);" class="child-up">上移</a>' +
						'</li>' +
						'<li class="form-size-4 font-md" class="child-down">' +
						'<a href="javascript:void(0);">下移</a>' +
						'</li>' +
						'</ul>' +
						'</td>'
				}
				//添加
				$ipt_table.append(tablehtml);
			}
		});

		//删除
		$("body").on("click", ".child-delete", function() {
			$(this).parent().parent().parent().parent().remove();
		});
		//上移
		$("body").on("click", ".child-up", function() {
			var $tr = $(this).parent().parent().parent().parent();
			if($tr.prev().find("th").length == 0) {
				$tr.prev().before($tr.prop("outerHTML"));
				$tr.remove();
			}
		});
		//下移
		$("body").on("click", ".child-down", function() {
			var $tr = $(this).parent().parent().parent().parent();
			if($tr.next().find("td").length > 0) {
				$tr.next().after($tr.prop("outerHTML"));
				$tr.remove();
			}
		});
	}

	//切换方法
	function tabInit() {
		$("body").on("click", ".tab-list li", function() {
			var showTab = $(this).attr("data-tab");
			$(this).parent().find("li").removeClass("active");
			$(this).addClass("active");
			$(".tab-content").addClass("display-none");
			$(".tab-content[data-tab='" + showTab + "']").removeClass("display-none");
			if(showTab == "choose") {
				$("#choose-editor-form").chosen();
			}
		});
	}

	var layerWindow;
	//打开窗口方法
	function openAddWindow(title, contentid) {
		/*var area = [$(window).width() > 800 ? '800px' : '95%', $(window).height() > 600 ? '600px' : '95%'];*/
		//高度自适应
		var area = ['800px'];
		options = {
			type: 1,
			title: title,
			shadeClose: true,
			maxmin: false,
			moveOut: true,
			area: area
		}
		if($(window).width() < 480 || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) && top.$(".J_mainContent").length > 0) {
			/*options.area = [top.$(".J_mainContent").width() + "px", top.$(".J_mainContent").height() + "px"];*/
			options.area = [top.$(".J_mainContent").width() + "px"];
			options.offset = [top.$(".J_mainContent").scrollTop() + "px", "0px"];
		}
		options.content = $("#" + contentid).html();
		layerWindow = Layer.open(options);
	}

	//表单属性设置初始化
	function alertforminit() {
		//编辑表单属性
		$("#alert_form").bind("click", function() {
			openAddWindow("表单属性", "model-alert");
		});

		//编辑表单属性保存
		$("body").on("click", '.forminfo-save', function() {
			$formdiv = $(this).parent().parent().parent();
			//先验证数据是否填写完整
			var formname = $formdiv.find(".form-name").val();
			var formfilename = $formdiv.find(".form-filename").val();
			var formaddurl = $formdiv.find(".form-addurl").val();
			var formeditorurl = $formdiv.find(".form-editorurl").val();
			var formmethod = $formdiv.find(".form-method").val();

			if(formname && formfilename && (formaddurl || formeditorurl) && formmethod) {
				var filenameRegexp = /^[a-zA-Z0-9]+$/;
				if(!filenameRegexp.test(formfilename)) {
					Layer.alert("存储文件名只能为英文或数字");
					return;
				}
			} else {
				Layer.alert("请将表单属性填写完整");
				return;
			}

			//再通过保存的表单数据判断是否为初次执行
			if(formobj.name) {
				//非初次 改变
				Formeditor.api.editorform({
					label: formname,
					//添加的form提交url
					addurl: formaddurl,
					//编辑的form提交url
					editorurl: formeditorurl,
					method: formmethod
				});
			} else {
				//初次执行 创建
				Formeditor.api.addform({
					label: formname,
					//添加的form提交url
					addurl: formaddurl,
					//编辑的form提交url
					editorurl: formeditorurl,
					method: formmethod
				});
			}

			//储存值
			formobj.name = formname;
			formobj.filename = formfilename;
			formobj.addurl = formaddurl;
			formobj.eidtorurl = formeditorurl;
			formobj.method = formmethod;

			Layer.close(layerWindow);
		});

		//模拟点击一次
		$("#alert_form").trigger("click");
	}

	//保存
	$("#save_form").bind("click", function() {
		var loadLayer;
		var formhmtl = Formeditor.api.getform();
		if(formhmtl && formobj.name && formobj.filename && (formobj.addurl || formobj.eidtorurl) && formobj.method) {
			var createhtml = Formeditor.api.createform(formhmtl);
			$.ajax({
				type: "post",
				url: "/Home/Form/form_create",
				async: true,
				data: {
					cover: false,
					filename: formobj.filename,
					editorhtml: createhtml.editorhtml,
					addhtml: createhtml.addhtml
				},
				beforeSend: function() {
					loadLayer = Layer.load(1);
				},
				success: function(data) {
					/*data = eval("(" + data + ")");*/
					Layer.close(loadLayer);
					if(data.status == 0) {
						Layer.alert(data.msg);
					} else if(data.status == 1) {
						Layer.msg("创建表单成功", {
							time: 1500
						});
					} else if(data.status == 2) {
						//表单存在
						layer.confirm('表单已存在是否覆盖该文件？', {
							btn: ['覆盖', '取消'] //按钮
						}, function() {
							//点击覆盖的时候再次提交
							$.ajax({
								type: "post",
								url: "/office/form/form_create",
								async: true,
								data: {
									cover: true,
									filename: formobj.filename,
									editorhtml: createhtml.editorhtml,
									addhtml: createhtml.addhtml
								},
								beforeSend: function() {
									loadLayer = Layer.load(1);
								},
								success: function(data) {
									data = eval("(" + data + ")");
									Layer.close(loadLayer);
									if(data.status == 0) {
										Layer.alert(data.msg);
									} else if(data.status == 1) {
										Layer.msg("创建表单成功", {
											time: 1500
										});
									}
								}
							});

						}, function() {});

					}
				}
			});
		} else {
			Layer.alert("请先创建表单");
		}
	});

});