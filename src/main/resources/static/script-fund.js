$(document).ready(function() {
    $('#queryButton').click(function() {
        queryData();
    });
});

function queryData() {
    const customerId = $('#customerId').val();
    const jjdm = $('#jjdm').val().split(',').map(code => code.trim());//可输入多个基金

    console.log('输入的客户号:', customerId);
    console.log('输入的基金代码:', jjdm);

    if (!customerId || jjdm.length === 0 || jjdm.includes('')) {
        alert('请输入客户号和至少一个基金代码');
        return;
    }

    const url = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/jjzl/${customerId}/${jjdm.join(',')}`;

    console.log('请求的URL:', url);

    $.getJSON(url, function(response) {
        console.log('响应数据:', response);

        if (response.success) {
            const data = response.data;

            let resultHTML = `<h2>查询结果</h2>`;

            data.forEach(item => {
                resultHTML += `<h3>客户号: ${item.khh !== undefined && item.khh !== null ? item.khh : '--'}</h3>`;
                resultHTML += `<p>客户姓名: ${item.khxm !== undefined && item.khxm !== null ? item.khxm : '--'}</p>`;
                resultHTML += `<p>基金代码: ${item.jjdm !== undefined && item.jjdm !== null ? item.jjdm : '--'}</p>`;
                resultHTML += `<p>基金简称: ${item.jjjc !== undefined && item.jjjc !== null ? item.jjjc : '--'}</p>`;
                resultHTML += `<p>开放日: ${item.kcrq !== undefined && item.kcrq !== null ? item.kcrq : '--'}</p>`;
                resultHTML += `<p>份额累计: ${item.fhlj!== undefined && item.fhlj !== null ? item.fhlj : '--'}</p>`;
                resultHTML += `<p>持仓收益: ${item.ccsy !== undefined && item.ccsy !== null ? item.ccsy : '--'}</p>`;
                resultHTML += `<p>总收益: ${item.zsy!== undefined && item.zsy !== null ? item.zsy : '--'}</p>`;

                if (item.jjfjhr && item.jjfjhr.length > 0) {
                    resultHTML += `<h4>分红记录:</h4>`;
                    item.jjfjhr.forEach(record => {
                        resultHTML += `<p>日期: ${record.rq}, 分红金额: ${record.fhje}</p>`;
                    });
                }

                resultHTML += `<hr>`;
            });

            $('#result').html(resultHTML);
        } else {
            $('#result').html(`<h2>查询失败</h2><p>错误信息: ${response.msg}</p>`);
        }
    }).fail(function(error) {
        console.error('Error fetching data:', error);
        alert('查询出错，请稍后再试');
    });
}
