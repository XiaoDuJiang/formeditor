<?php
/**
 * Created by PhpStorm.
 * User: 郭 奡
 * Date: 2018/6/14
 * Time: 9:36
 */

namespace Home\Controller;

use Think\Controller;
use Think\Exception;

class FormController extends Controller
{	
	
    /**
     * 创建表单文件
     */
    public function form_create()
    {
        //文件名  //是否覆盖
        if (($_POST['addhtml'] || $_POST['editorhtml']) && isset($_POST['filename']) && isset($_POST['cover'])) {
            $result = array();

            //创建文件夹
            if (!is_dir('./Application/Home/View/formeditor')) {
                $creatfiledir = mkdir('./Application/Home/View/formeditor', 0777); // 使用最大权限0777创建文件
                if(!$creatfiledir) {
                	$result['msg'] = '文件夹创建失败';
                    $result['status'] = 0;
                	$this->ajaxReturn($result);
                }
            }

            $fileName_add = './Application/Home/View/formeditor/' . $_POST['filename'] . 'add.html';
            $fileName_editor = './Application/Home/View/formeditor/' . $_POST['filename'] . 'editor.html';

            if ($_POST['cover'] == 'false') {
                //文件是否存在
                //存在则返回提示
                if (($_POST['addhtml'] && file_exists($fileName_add) == 1) || ($_POST['editorhtml'] && file_exists($fileName_editor) == 1)) {
                    $result['msg'] = '文件已存在';
                    $result['status'] = 2;
                    $this->ajaxReturn($result);
                }
            }

            //创建
            $head1 = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title></title>';
            $head3 = '<link rel="stylesheet" type="text/css" href="__JS__/formeditor/css/formeditor.css" /><link rel="stylesheet" type="text/css" href="__CSS__/formeditor.css" /><script src="__JS__/jquery/jquery-2.1.0.js" type="text/javascript" charset="utf-8"></script><script src="__JS__/laydate/laydate.js" type="text/javascript" charset="utf-8"></script><script src="__JS__/chosen/chosen.jquery.js" type="text/javascript" charset="utf-8"></script><script src="__JS__/layer/layer.js" type="text/javascript" charset="utf-8"></script></head><body class="gray-bg" data-plugin="tooltip">';
            $foot = "</body></html>";

            try {
                //add
                if ($_POST['addhtml']) {
                    $addfile = fopen($fileName_add, "w");
                    if ($addfile) {
                        $addtxt = $_POST['addhtml'] . $foot;
                        fwrite($addfile, $head1);
                        fwrite($addfile, $head3);
                        fwrite($addfile, $addtxt);
                        fclose($addfile);
                    }
                }

                if ($_POST['editorhtml']) {
                    //editor
                    $editorfile = fopen($fileName_editor, "w");
                    if ($editorfile) {
                        $editortxt = $_POST['editorhtml'] . $foot;
                        fwrite($editorfile, $head1);
                        fwrite($editorfile, $head3);
                        fwrite($editorfile, $editortxt);
                        fclose($editorfile);
                    }
                }


                $result['msg'] = '创建表单html文件成功。';
                $result['status'] = 1;
                $this->ajaxReturn($result);
            } catch (Exception $e) {
                $result['msg'] = '创建表单html文件失败；' . $e->getMessage();
                $result['status'] = 0;
                $this->ajaxReturn($result);
            }
        }
    }

}