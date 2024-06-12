$(document).ready(function() {
    $('#dateType').val('single');
    $('#singleDateField').show();
    $('#dateRangeFields').hide();

    // 获取当前日期
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    // 设置格式
    const todayFormatted = `${year}${month}${day}`;

    // 设置单日期输入栏的默认值为当前日期
    $('#singleDate').val(todayFormatted)
    $('#endDate').val(todayFormatted)
    $('#startDate').val(todayFormatted);

    // 绑定 change 事件
    $('#dateType').change(function() {
        if ($(this).val() === 'single') {
            $('#singleDateField').show(); // 显示单日期字段
            $('#dateRangeFields').hide(); // 隐藏日期范围字段
        } else {
            $('#singleDateField').hide();
            $('#dateRangeFields').show();
        }
    });

    $('#queryButton').click(function() {
        queryData();
    });
});


/** 需要输入的内容 */
function queryData() {
    const customerId = $('#customerId').val();
    const dateType = $('#dateType').val();

    // 获取输入的日期值
    const startDate = $('#startDate').val();
    const endDate = $('#endDate').val();
    const singleDate = $('#singleDate').val();

    console.log('输入的客户号:', customerId);
    console.log('选择的日期类型:', dateType);
    if (dateType === 'range') {
        console.log('输入的开始日期:', startDate);
        console.log('输入的结束日期:', endDate);
    } else {
        console.log('输入的单日期:', singleDate);
    }
    /** 检查输入内容不为空 */
    if (!customerId || (dateType === 'range' && (!startDate || !endDate)) || (dateType === 'single' && !singleDate)) {
        alert('请输入客户号和日期范围或单日日期');
        return;
    }

    /** 第一个url：用于资产range里面的资产数据 */
    const url1 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/zhzc/${customerId}`;
    console.log('请求的URL1:', url1);

    $.getJSON(url1, function(data1) {
        console.log('响应数据1:', data1);
        if (!data1.success) {
            alert('查询失败，请检查输入的信息');
            return;
        }

        if (dateType === 'range') {
            getRangeData(customerId, startDate, endDate, data1); // 查询日期范围数据
        } else {
            const url3 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/ykls/${customerId}/${singleDate}`;
            console.log('请求的URL3:', url3);
            $.getJSON(url3, function(data3) {
                handleData(data1, null, data3.data, dateType, singleDate); // 处理单日数据
            }).fail(function() {
                alert('查询失败，请检查输入的信息');
            });
        }
    }).fail(function() {
        alert('查询失败，请检查输入的信息');
    });
}


function getRangeData(customerId, startDate, endDate, data1) {
    /** url2: 客户在指定日期范围内的总资产数据（当天总资产） */
    const url2 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/zhzcls/zzc/${customerId}/${startDate}/${endDate}`;
    /** url4:获取客户在指定日期范围内的盈亏数据（当天收益） */
    const url4 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/ykls/range/${customerId}/${startDate}/${endDate}`;
    console.log('请求的URL2:', url2);
    console.log('请求的URL4:', url4);

    $.when($.getJSON(url2), $.getJSON(url4)).done(function(data2Response, data4Response) {
        const data2 = data2Response[0].data;
        const data4 = data4Response[0].data;
        handleData(data1, data2, data4, 'range'); // 处理日期范围数据
    }).fail(function() {
        alert('查询失败，请检查输入的信息');
    });
}

function getPreviousDate(dateString, days) {
    const date = new Date(dateString.slice(0, 4), dateString.slice(4, 6) - 1, dateString.slice(6));
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}${month}${day}`;
}

function handleData(data1, data2, data3, dateType, singleDate) {
    console.log('handleData 数据:', { data1, data2, data3 });
    let dailyData = [];

    if (dateType === 'range' && data2 && typeof data2 === 'object' && data3 && typeof data3 === 'object') {
        dailyData = Object.keys(data2).map(date => {
            const weekday = new Date(date.slice(0, 4), date.slice(4, 6) - 1, date.slice(6)).toLocaleDateString('zh-CN', { weekday: 'long' });
            const drzhzc = data2[date] !== undefined ? data2[date] : '--'; //显示星期几
            const yk = data3[date] !== undefined ? data3[date] : '--';
            return { date, drzhzc, yk, weekday }; // 构建每天的数据对象
        });
    }

    if (dateType === 'single' && singleDate) {
        const previousDate1 = getPreviousDate(singleDate, 1);
        const previousDate2 = getPreviousDate(singleDate, 2);

        $('#result').html(`
            <h2>当日实时资产</h2>
            <p>客户号: ${data1.data.khh !== undefined && data1.data.khh !== null ? data1.data.khh : '--'}</p>
            <p>客户姓名: ${data1.data.khxm !== undefined && data1.data.khxm !== null ? data1.data.khxm : '--'}</p>
            <p>总资产: ${data1.data.zzc !== undefined && data1.data.zzc !== null ? data1.data.zzc : '--'}</p>
            <p>账户资金余额: ${data1.data.zhzjye !== undefined && data1.data.zhzjye !== null ? data1.data.zhzjye : '--'}</p> 
            <p>可用资金: ${data1.data.kyzj !== undefined && data1.data.kyzj !== null ? data1.data.kyzj : '--'}</p>
            <p>冻结资金: ${data1.data.djzj !== undefined && data1.data.djzj !== null ? data1.data.djzj : '--'}</p>
            <p>待交收: ${data1.data.djs !== undefined && data1.data.djs !== null ? data1.data.djs : '--'}</p>
            <p>股票持仓金额: ${data1.data.gpccje !== undefined && data1.data.gpccje !== null ? data1.data.gpccje : '--'}</p>
            <p>债卷持仓金额: ${data1.data.zqccje !== undefined && data1.data.zqccje !== null ? data1.data.zqccje : '--'}</p>
            <p>场内基金持仓金额: ${data1.data.jjccje !== undefined && data1.data.jjccje !== null ? data1.data.jjccje : '--'}</p>
            <p>场外基金持仓金额: ${data1.data.cwjjccje !== undefined && data1.data.cwjjccje !== null ? data1.data.cwjjccje : '--'}</p>
            <p>金融产品持仓金额: ${data1.data.jrcpccje !== undefined && data1.data.jrcpccje !== null ? data1.data.jrcpccje : '--'}</p>
            <p>融资融卷持仓: ${data1.data.rzrqccje !== undefined && data1.data.rzrqccje !== null ? data1.data.rzrqccje : '--'}</p>         
            <p>融资融卷负债: ${data1.data.rzrqfz !== undefined && data1.data.rzrqfz !== null ? data1.data.rzrqfz : '--'}</p>
            <p>期权持仓金额: ${data1.data.qqccje !== undefined && data1.data.qqccje !== null ? data1.data.qqccje : '--'}</p>
            <p>买入成交金额: ${data1.data.mrcjje !== undefined && data1.data.mrcjje !== null ? data1.data.mrcjje : '--'}</p>
            <p>卖出成交金额: ${data1.data.mccjje !== undefined && data1.data.mccjje !== null ? data1.data.mccjje : '--'}</p>
            
            <h2>单日盈亏数据 (${data3.rq !== undefined ? data3.rq : '无数据'})</h2>
            <p>当日账户资产: ${data3.drzhzc !== undefined ? data3.drzhzc : '无数据'}</p>
            <p>上日账户资产: ${data3.srzhzc !== undefined ? data3.srzhzc : '无数据'}</p>
            <p>盈亏: ${data3.yk !== undefined ? data3.yk : '无数据'}</p>
        `);
    } else {
        $('#result').html(`
            <h2>资产数据</h2>
            <p>客户号: ${data1.data.khh !== undefined && data1.data.khh !== null ? data1.data.khh : '--'}</p>
            <p>客户姓名: ${data1.data.khxm !== undefined && data1.data.khxm !== null ? data1.data.khxm : '--'}</p>
            <p>总资产: ${data1.data.zzc !== undefined && data1.data.zzc !== null ? data1.data.zzc : '--'}</p>
            <p>可用资金: ${data1.data.kyzj !== undefined && data1.data.kyzj !== null ? data1.data.kyzj : '--'}</p>
            <p>冻结资金: ${data1.data.djzj !== undefined && data1.data.djzj !== null ? data1.data.djzj : '--'}</p>
            <p>待交收: ${data1.data.djs !== undefined && data1.data.djs !== null ? data1.data.djs : '--'}</p>
            <p>股票持仓金额: ${data1.data.gpccje !== undefined && data1.data.gpccje !== null ? data1.data.gpccje : '--'}</p>
            <p>债卷持仓金额: ${data1.data.zqccje !== undefined && data1.data.zqccje !== null ? data1.data.zqccje : '--'}</p>
            <p>场内基金持仓金额: ${data1.data.jjccje !== undefined && data1.data.jjccje !== null ? data1.data.jjccje : '--'}</p>
            <p>场外基金持仓金额: ${data1.data.cwjjccje !== undefined && data1.data.cwjjccje !== null ? data1.data.cwjjccje : '--'}</p>
            <p>金融产品持仓金额: ${data1.data.jrcpccje !== undefined && data1.data.jrcpccje !== null ? data1.data.jrcpccje : '--'}</p>
            <p>融资融卷持仓: ${data1.data.rzrqccje !== undefined && data1.data.rzrqccje !== null ? data1.data.rzrqccje : '--'}</p>
            <p>账户资金余额: ${data1.data.zhzjye !== undefined && data1.data.zhzjye !== null ? data1.data.zhzjye : '--'}</p>
            <p>买入成交金额: ${data1.data.mrcjje !== undefined && data1.data.mrcjje !== null ? data1.data.mrcjje : '--'}</p>
            <p>卖出成交金额: ${data1.data.mccjje !== undefined && data1.data.mccjje !== null ? data1.data.mccjje : '--'}</p>
            <p>融资融卷负债: ${data1.data.rzrqfz !== undefined && data1.data.rzrqfz !== null ? data1.data.rzrqfz : '--'}</p>
            <p>期权持仓金额: ${data1.data.qqccje !== undefined && data1.data.qqccje !== null ? data1.data.qqccje : '--'}</p>
            ${dateType === 'range' && dailyData.length > 0 ? `
            <h2>日期范围内的每天数据</h2>
            ${dailyData.map(item => `
                <p>日期: ${item.date} (${item.weekday})</p>
                <p>当日总资产: ${item.drzhzc !== undefined ? item.drzhzc : '--'}</p>
                <p>当天收益: ${item.yk !== undefined ? item.yk : '--'}</p>
            `).join('<br>')}
            ` : ''}
        `);
    }
}

