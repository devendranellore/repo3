$(function(){
    //绑定ul实现的 单选点击
    $(".ul-radio>li").each(function(){
        $(this).on('click',function(){
            $(this).closest('.ul-radio').find('li').each(function(){
                $(this).removeClass('active');
            });
            $(this).addClass('active');
        })
    });

    $(".ul-checkbox>li").each(function(){
        $(this).on('click',function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active');
            }else{
                $(this).addClass('active');
            }

        })
    });

    var ch = window.innerHeight;
    $('.dropdown-full').css('height',ch  - 56 + 'px');
    $(window).resize(function(){
        ch = window.innerHeight;
        $('.dropdown-full').css('height',ch  - 56 + 'px');
    });
    //绑定展开和折叠filter区域的事件
    $('.colspace-btn').on('click',function(){
        if($(this).hasClass('active')){
            $(this).closest('.col-colspace').find('.colspace-container').animate({height:'0'},300);
            $(this).removeClass('active');
        }else{
            $(this).closest('.col-colspace').find('.colspace-container').animate({height:'274px'},300);
            $(this).addClass('active');
        }
    });
    //绑定复选框事件，自定义复选框效果 -- 表头全选按钮
    $('.th-radio').each(function(){
        $(this).find('span').on('click',function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active');
                $(this).closest('.th-radio').find("input[type='checkbox']").prop('checked',false);
                $(this).closest('.table').find('.td-radio').each(function(){
                    $(this).closest('tr').removeClass('selected');
                    $(this).find('span').removeClass('active');
                    $(this).find("input[type='checkbox']").prop('checked',false);
                });
                $('.select-menu').hide();
            }else{
                $(this).addClass('active');
                $(this).closest('.th-radio').find("input[type='checkbox']").prop('checked',true);
                var newSelected = 0;
                $(this).closest('.table').find('.td-radio').each(function(){
                    newSelected++;
                    $(this).closest('tr').addClass('selected');
                    $(this).find('span').addClass('active');
                    $(this).find("input[type='checkbox']").prop('checked',true);
                });
                $('.select-menu').find('.select-menulab').html(newSelected + ' Items Selected');
                $('.select-menu').show();
            }
        });
    });

    //绑定复选框事件，自定义复选框效果
    $('.td-radio').each(function(){
        $(this).find('span').on('click',function(){
            var newSelected = 0;
            if($(this).hasClass('active')){
                $(this).removeClass('active');
                $(this).closest('.td-radio').find("input[type='checkbox']").prop('checked',false);
                $(this).closest('tr').removeClass('selected');
                if($(this).closest('.table').find('.th-radio>span').hasClass('active')){
                    $(this).closest('.table').find('.th-radio>span').removeClass('active');
                    $(this).closest('.table').find(".th-radio>input[type='checkbox']").prop('checked',false);
                }
                $(this).closest('.table').find('.td-radio>span').each(function(){
                    if($(this).hasClass('active')) {
                        newSelected++;
                    }
                });
                if(newSelected >0){
                    $('.select-menu').find('.select-menulab').html(newSelected + ' Items Selected');
                    $('.select-menu').show();
                }else{
                    $('.select-menu').hide();
                }
            }else{
                $(this).addClass('active');
                $(this).closest('.td-radio').find("input[type='checkbox']").prop('checked',true);
                $(this).closest('tr').addClass('selected');
                var allSelect = true;
                $(this).closest('.table').find('.td-radio>span').each(function(){
                    if(!$(this).hasClass('active')) {
                        allSelect = false;
                    }else{
                        newSelected++;
                        $('.select-menu').find('span').html(newSelected + ' Items Selected');
                        if($('.select-menu').css('display') == 'none'){
                            $('.select-menu').show();
                        }
                    }
                });
                if(allSelect){
                    $(this).closest('.table').find('.th-radio>span').addClass('active');
                    $(this).closest('.table').find(".th-radio>input[type='checkbox']").prop('checked',true);
                }
            }
        });
    });

    // 绑定每页显示条数选择
    $('.ul-select>li>a').each(function(){
        $(this).on('click',function(){
            $(this).closest('.selectbar').children('a').html($(this).html());
        });
    });

    // 流式布局复选按钮组
    bindingNavCheckbox();
    $('.nav-checkbox>li>span').each(function(){
        $(this).on('click',function(){
            $(this).closest('.nav-checkbox').find('li').each(function(){
                $(this).removeClass('active');
            });
            $(this).closest('.nav-checkbox').find('.input-checkbox').each(function(){
                $(this).find('ul>li').each(function(){
                    $(this).removeClass('active');
                });
                $(this).find('input').val('');
                $(this).find('input').attr('data-value','');
            });

            $(this).closest('.nav-checkbox').find('.input-select').each(function(){
                $(this).find('input').val('');
                $(this).find('input').attr('data-value','');
            });
        });
    });

    $('.more-filters-btn').each(function(){
        $(this).off('click');
        $(this).on('click',function(){
            var obj = $(this).closest('.filter-area').find('.more-filters');
            var realHeight = obj.height();
            var needHeight = 0;
            if(realHeight == 0){
                $(this).html('Hide Filters');
                needHeight = obj.find('.filter-area').height();
                $(obj).animate({'height':needHeight + 'px'},300,function(){
                    $(obj).css('overflow','visible');
                });
            }else{
                $(this).html('Show More Filters');
                $(obj).animate({'height':needHeight + 'px'},300,function(){
                    $(obj).css('overflow','hidden');
                });
            }
        });
    });

    bindingTableModal();
    bindingTableSorting();
    bindingColpTitle();
    bindingNavRadio();

    $('.colp-child').each(function(){
        $(this).on('click',function(){
            if($(this).find('span').hasClass('checked')){
                $(this).find('span').removeClass('checked');
                $(this).closest('span').removeClass('active');
                $(this).closest('.colp-content').find('.colp-title>span').removeClass('checked');
            }else{
                $(this).find('span').addClass('checked');
                $(this).closest('span').addClass('active');
                var flag = true;
                $(this).closest('.colp-body').find('.colp-child>span').each(function(){
                    if(!$(this).hasClass('checked')){
                        flag = false;
                    }
                });
                if(flag){
                    $(this).closest('.colp-content').find('.colp-title>span').addClass('checked');
                }
            }
            makeColpselect();
        }) ;
    });

    $('.nav-headers>li>a').each(function(){
        $(this).on('click',function(){
            var dataTarget = $(this).closest('li').attr('data-target');
            $(this).closest('.nav-headers').find('li').each(function(){
                $(this).removeClass('active');
            });
            $(this).closest('li').addClass('active');
            $(this).closest('.content').find('.nav-tabs-area').each(function(){
                if($(this).attr('data-target') == dataTarget){
                    $(this).addClass('open');
                }else{
                    $(this).removeClass('open');
                }
            });
            $(this).closest('.modal-content').find('.nav-tabs-area').each(function(){
                if($(this).attr('data-target') == dataTarget){
                    $(this).addClass('open');
                }else{
                    $(this).removeClass('open');
                }
            });
        });
    });


    $('.radio-flag').each(function(){
        $(this).on('click',function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active');
                $(this).closest('.radio-flag-content').find('a').html('NO');
            }else{
                $(this).addClass('active');
                $(this).closest('.radio-flag-content').find('a').html('YES');
            }
        });
    });

    bindingInputSelect();
    bindingInputCheckbox();
    bindingFileRemove();
    bindingFileSelect();
    bindingInputSelectModal();
    bindingTableCheck();
    bindingTdPop();
});

function bindingNavCheckbox(){
    // 流式布局复选按钮组
    $('.nav-checkbox>li>a').each(function(){
        if($(this).attr('data-status') != 0){
            $(this).on('click',function(){
                if($(this).closest('li').hasClass('active')){
                    $(this).closest('li').removeClass('active');
                }else{
                    $(this).closest('li').addClass('active');
                }
            });
        }
    });
}

function bindingColpTitle(){
    $('.colp-title>span').each(function(){
        if($(this).attr('data-status') != 0){
            $(this).on('click',function(){
                if($(this).hasClass('checked')){
                    $(this).removeClass('checked');
                    $(this).closest('.colp-content').find('.colp-body').find('.colp-child>span').each(function(){
                        $(this).removeClass('checked');
                        $(this).closest('.colp-child').closest('span').removeClass('active');
                    });
                }else{
                    $(this).addClass('checked');
                    $(this).closest('.colp-content').find('.colp-body').find('.colp-child>span').each(function(){
                        $(this).addClass('checked');
                        $(this).closest('.colp-child').closest('span').addClass('active');
                    });
                    $(this).closest('.colp-content').find('.colp-body').show();
                }
                makeColpselect();
            });
        }
    });
    $('.colp-title>a').each(function(){
        if($(this).attr('data-status') != 0) {
            if ($(this).hasClass('open')) {
                $(this).closest('.colp-content').find('.colp-body').show();
            }
            $(this).on('click', function () {
                if ($(this).hasClass('open')) {
                    $(this).removeClass('open');
                    $(this).closest('.colp-content').find('.colp-body').hide();
                } else {
                    $(this).addClass('open');
                    $(this).closest('.colp-content').find('.colp-body').show();
                }
            });
        }
    });
}


/**
 * 绑定input-select组件事件
 */
function bindingInputSelect(){
    $(".input-select").each(function(){
        if(!$(this).find('input').prop('readonly')){
            $(this).find('input').prop('readonly',true);
            $(this).find('input').on('click',function(){
                var count =  $(this).closest('.input-select').find('ul').find('li').length;
                var ht =  (count * 44) - 1;
                $(this).closest('.input-select').find('ul').css('height',ht + 'px');
                //$(this).closest('.input-select').find('ul').animate({height:ht + 'px'},300);
            });

            $(this).on('mouseleave',function(){
                $(this).find('ul').animate({height:'0px'},300);
            });

            $(this).find('ul').find('li').each(function(){
                $(this).off('click');
                $(this).on('click',function(){
                    var dataCallback = $(this).closest('ul').attr('data-callback');
                    var ml = $(this).html();
                    var dataValue = $(this).attr('data-value');
                    $(this).closest('.input-select').find('input').val(ml);
                    $(this).closest('.input-select').find('input').attr('data-value',dataValue);
                    $(this).closest('.input-select').find('input').removeClass('input-warning');
                    $(this).closest('ul').animate({height:'0px'},300);
                    if(dataCallback!= undefined && dataCallback!=null && dataCallback!=''){
                        eval(dataCallback + "(" + dataValue + ")");
                    }
                });
            });
        }
    });
}

/**
 * 下拉式复选
 */
function bindingInputCheckbox(){
    $(".input-checkbox").each(function(){
        $(this).find('input').attr('readonly','readonly');
        $(this).find('input').on('click',function(){
            var count =  $(this).closest('.input-checkbox').find('ul').find('li').length;
            var ht =  (count * 44) - 1;
            $(this).closest('.input-checkbox').find('ul').animate({height:ht + 'px'},300);
            $(this).closest('.more-filters').css('overflow','visible');
        });

        $(this).on('mouseleave',function(){
            $(this).find('ul').animate({height:'0px'},300);
            $(this).closest('.more-filters').css('overflow','hidden');
        });

        $(this).find('ul').find('li').each(function(){
            $(this).on('click',function(){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                }else{
                    $(this).addClass('active');
                }
                var dataValue = '';
                var ml = '';
                $(this).closest('ul').find('li.active').each(function(){
                    dataValue += $(this).attr('data-value') + ',';
                    ml += $(this).html() + ',';
                });
                if(dataValue.length > 0 && ml.length > 0){
                    dataValue = dataValue.substring(0,dataValue.length -1);
                    ml = ml.substring(0,ml.length -1);
                }
                $(this).closest('.input-checkbox').find('input').val(ml);
                $(this).closest('.input-checkbox').find('input').attr('data-value',dataValue);
            });
        });
    });
}

function bindingFileSelect(){
    $(".upload-group>input[type='file']").each(function(){
        $(this).on('change',function(){
            $(this).closest('.upload-group').hide();
            $(this).closest('.upload-area').find('.upload-files').show();
        });
    });
}

function bindingFileRemove(){
    $('.file-remove-a').each(function(){
        $(this).off('click');
        $(this).on('click',function(){
            $(this).closest('.upload-files').hide();
            $(this).closest('.upload-area').find(".upload-group>input[type='file']").off('change');
            $(this).closest('.upload-area').find(".upload-group>input[type='file']").val('');
            $(this).closest('.upload-area').find(".upload-group>input[type='file']").on('change',function(){
                $(this).closest('.upload-group').hide();
                $(this).closest('.upload-area').find('.upload-files').show();
            });
            $(this).closest('.upload-area').find('.upload-group').show();
        });
    });
}

function makeColpselect(){
    $('.colp').each(function(){
        var csob = $(this).find('.colp-selected');
        csob.html('');
        $(this).find('.colp-content').each(function(){
            if($(this).find('.colp-child>span.checked').length >0){
                var ml = '<div class="colps-content"><div class="colps-title" data-id="' + $(this).find('.colp-title').attr("data-id") + '">' + $(this).find('.colp-title>a').html() + '<a><i class="fa fa-trash"></i></a></div>' +
                    '<div class="colps-body clearfix"></div></div>';
                var ob = $(ml);
                $(this).find('.colp-child>span.checked').each(function(){
                    var obj = $(this).closest('.colp-child').clone();
                    obj.find('span').remove();
                    obj.removeClass('colp-child');
                    obj.addClass('colps-child');
                    obj.append('<span><i class="fa fa-trash"></i></span>');
                    var so = $('<span class="col-sm-4"></span>');
                    so.append(obj);
                    ob.find('.colps-body').append(so);
                    csob.append(ob);
                });
            }
        });
        bindingColpsremove();
    });
}

function bindingColpsremove(){
    $('.colp').each(function(){
        var colp = $(this);
        $(this).find('.colps-child>span').each(function(){
            $(this).on('click',function(){
                var dataId = $(this).closest('.colps-child').attr('data-id');
                var par = $(this).closest('.colps-body');
                $(this).closest('.colps-child').closest('span').remove();
                if(par.find('span').length == 0){
                    par.closest('.colps-content').remove();
                }
                colp.closest('.colp').find('.colp-child>span.checked').each(function(){
                    if($(this).closest('.colp-child').attr('data-id') == dataId){
                        $(this).removeClass('checked');
                        $(this).closest('.colp-child').closest('span').removeClass('active');
                        $(this).closest('.colp-content').find('.colp-title').find('span').removeClass('checked');
                    }
                });
            });
        });

        $(this).find('.colps-title>a').each(function(){
            $(this).on('click',function(){
                var dataId = $(this).closest('.colps-title').attr('data-id');
                var par = $(this).closest('.colps-body');
                $(this).closest('.colps-content').remove();
                colp.closest('.colp').find('.colp-title').each(function(){
                    if($(this).attr('data-id') == dataId){
                        $(this).find('span').removeClass('checked');
                        $(this).closest('.colp-content').find('.colp-child>span').each(function(){
                            $(this).removeClass('checked');
                            $(this).closest('.colp-child').closest('span').removeClass('active');
                        });
                    }
                });
            });
        });
    });
}

function bindingTableSorting(){
    $('.table-sorting').each(function(){
        var tb = $(this).find('tbody');
        var ths = $(this).find('thead>tr>th');
        var ts =  ths.length;
        var trs = $(this).find('tbody>tr');
        var rs = trs.length;
        var tls = new Array(ts);
        for(var i=0;i<ts;i++){
            tls[i] = new Array(rs);
        }

        $.each(ths,function(k1,v1){
            $.each(trs,function(k2,v2){
                var arr = tls[k1];
                arr[k2] = $($(v2).find('td')[k1]).html();
            });
            $(v1).on('click',function(){
                $(tb).html('');
                var tlsorting = tls[k1];
                $.each(tlsorting.sort(),function(k,v){
                    $.each(trs,function(k3,v3){
                        var ml = $($(v3).find('td')[k1]).html();
                        if(ml == v){
                            tb.append($(v3));
                        }
                    });
                })
                bindingTableSorting();
                bindingTableModal();
            });
        });
    });
}

function bindingTableModal(){
    $('.table-modal>tbody>tr').each(function(){
        $(this).on('click',function(){
            var modalName = $(this).attr('modal-name');
            if(modalName == undefined || modalName == null || modalName == ''){
                modalName = 'updateModel';
            }
            $('#' + modalName).modal('show');
        });
    });
}

function bindingInputSelectModal(){
    $('.input-modal-select').each(function(){
        $(this).find('input').prop('readonly',true);
        $(this).find('input').on('click',function(){
            $(this).closest('.modal-select-content').find(".modal").modal('show');
        });
    });
}

function removeAllSelects(obj){
    $(obj).closest('.modal-content').find('.modal-body').find('.nav-checkbox').find('li.active').each(function(){
        $(this).removeClass('active');
    });
}

function getSelects(obj){
    var count = $(obj).closest('.modal-content').find('.nav-checkbox>li.active').length;
    if(count == 0 ){
        $(obj).closest('.modal-select-content').find('.input-modal-select>input').val('');
        $(obj).closest('.modal').modal('hide');
    }else{
        var dataValue = '';
        $(obj).closest('.modal-content').find('.nav-checkbox>li.active').each(function(){
            dataValue += $(this).find('a').attr('data-id') + ',';
        });
        dataValue = dataValue.substring(0,dataValue.length - 1);
        $(obj).closest('.modal-select-content').find('.input-modal-select>input').attr('data-value',dataValue);
        $(obj).closest('.modal-select-content').find('.input-modal-select>input').val(count + " selected");
        $(obj).closest('.modal').modal('hide');
    }
}

function getSelectAlias(obj){
    var count = $(obj).closest('.modal-content').find('.colps-child').length;
    if(count == 0 ){
        $(obj).closest('.modal-select-content').find('.input-modal-select>input').val('');
        $(obj).closest('.modal').modal('hide');
    }else{
        var dataValue = '';
        $(obj).closest('.modal-content').find('.colps-child').each(function(){
            dataValue += $(this).attr('data-id') + ',';
        });
        dataValue = dataValue.substring(0,dataValue.length - 1);
        $(obj).closest('.modal-select-content').find('.input-modal-select>input').attr('data-value',dataValue);
        $(obj).closest('.modal-select-content').find('.input-modal-select>input').val(count + " selected");
        $(obj).closest('.modal').modal('hide');
    }
}

function bindingTableCheck(){
    $(".table-checkbox>span").each(function(){
        $(this).off('click');
        if('disabled' != $(this).attr('data-disabled')){
            $(this).on('click',function(){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                }else{
                    $(this).addClass('active');
                }
            });
        }
    });
}

function bindingNavRadio(){
    //流式布局单选按钮组
    $('.nav-radio>li>a').each(function(){
        $(this).off('click');
        if('disabled' != $(this).closest('.nav-radio').attr('data-disabled')){
            $(this).on('click',function(){
                if($(this).closest('li').hasClass('active')){
                    //$(this).closest('li').removeClass('active');

                }else{
                    $(this).closest('.nav-radio').find('li').each(function(){
                        $(this).removeClass('active');
                    });
                    $(this).closest('li').addClass('active');
                }
                var dataValue = $(this).closest('li').attr('data-value');
                var dataCallback = $(this).closest('.nav-radio').attr('data-callback');
                if(dataCallback!= undefined && dataCallback!= null && dataCallback!= ''){
                    eval(dataCallback + '(' + dataValue + ')');
                }
            });
        }
    });
    $('.nav-radio>li>span').each(function(){
        $(this).on('click',function(){
            $(this).closest('.nav-radio').find('li').each(function(){
                $(this).removeClass('active');
            });
            $(this).closest('.nav-radio').find('.input-checkbox').each(function(){
                $(this).find('ul>li').each(function(){
                    $(this).removeClass('active');
                });
                $(this).find('input').val('');
                $(this).find('input').attr('data-value','');
            });
        });
    });
}

function bindingTableCreating(){
    $('.table-create-btn>button').each(function(){
        $(this).off('click');
        $(this).on('click',function(){
            var flag = true;
            $(this).closest('.table-addon-inputs').find('.input-select>input').each(function(){
                if($(this).attr('data-value') == null || $(this).attr('data-value') == undefined || $(this).attr('data-value') == ''){
                    flag = false;
                    $(this).addClass('input-warning');
                }
            });
            $(this).closest('.table-addon-inputs').find('input').each(function(){
                if($(this).val() == null || $(this).val() == undefined || $(this).val() == ''){
                    flag = false;
                    $(this).addClass('input-warning');
                    $(this).on('focus',function(){
                        $(this).removeClass('input-warning');
                    });
                }
            });
            if(flag){
                var tr = $("<tr></tr>");
                var tds = $(this).closest('.table-addon-inputs').find('.table-addon-inptr>td');
                var tdobj;
                for(var t= 0;t<tds.length -1;t++){
                    tdobj = $(tds[t]).clone();
                    tdobj.find('.input-select>input').prop('readonly',false);
                    tr.append(tdobj);
                }
                tr.append('<td class="table-addon-btns tab-remove-btns"><button class="btn btn-danger"><i class="fa fa-trash"></i></button></td>');
                var trln = $(this).closest('.table-addon').find('.table-show>tbody>tr').length;
                if(trln == 0){
                    var theader = $(this).closest('table').find('thead').html();
                    $(this).closest('.table-addon').find('.table-show>thead').append(theader);
                }
                $(this).closest('.table-addon').find('.table-show>tbody').append(tr);

                bindingInputSelect();
                bindingTableRemoving();
                $(this).closest('.table-addon-inputs').find('.input-select>input').each(function(){
                    $(this).val("");
                    $(this).attr('data-value','');
                });
                $(this).closest('.table-addon-inputs').find('input').each(function(){
                    $(this).val("");
                });
            }
        });
    });
}

function bindingTableRemoving(){
    $('.tab-remove-btns>button').each(function(){
        $(this).off('click');
        $(this).on('click',function(){
            var trln = $(this).closest('.table-addon').find('.table-show>tbody>tr').length;
            if(trln == 1){
                $(this).closest('.table-addon').find('.table-show>thead').html('');
            }
            $(this).closest('tr').remove();
        });
    });
}

function bindingTdPop(){
    $(".td-pop").each(function(){
        $(this).find('span').on('click',function(){
            $(this).closest('.td-pop').find('.modal').modal();
        });
    });

}



function closeModal(modalName){
    $("#" + modalName).modal('hide');
}