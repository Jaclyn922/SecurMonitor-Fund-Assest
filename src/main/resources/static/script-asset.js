$(document).ready(function() {
    $('#dateType').change(function() {
        if ($(this).val() === 'range') {
            $('#dateRangeFields').show();
            $('#singleDateField').hide();
        } else {
            $('#dateRangeFields').hide();
            $('#singleDateField').show();
        }
    });

    $('#queryButton').click(function() {
        queryData();
    });
});

function queryData() {
    const customerId = $('#customerId').val();
    const dateType = $('#dateType').val();
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

    if (!customerId || (dateType === 'range' && (!startDate || !endDate)) || (dateType === 'single' && !singleDate)) {
        alert('请输入客户号和日期范围或单日日期');
        return;
    }

    const url1 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/zhzc/${customerId}`;
    console.log('请求的URL1:', url1);

    $.getJSON(url1, function(data1) {
        console.log('响应数据1:', data1);
        if (!data1.success) {
            alert('查询失败，请检查输入的信息');
            return;
        }

        if (dateType === 'range') {
            getRangeData(customerId, startDate, endDate, data1);
        } else {
            const url3 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/ykls/${customerId}/${singleDate}`;
            console.log('请求的URL3:', url3);
            $.getJSON(url3, function(data3) {
                handleData(data1, null, data3.data, dateType);
            }).fail(function() {
                alert('查询失败，请检查输入的信息');
            });
        }
    }).fail(function() {
        alert('查询失败，请检查输入的信息');
    });
}

function getRangeData(customerId, startDate, endDate, data1) {
    const url2 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/zhzcls/zzc/${customerId}/${startDate}/${endDate}`;
    const url4 = `/assetMonitor/bigDataApi/forwardReq?url=api/asset/ykls/range/${customerId}/${startDate}/${endDate}`;
    console.log('请求的URL2:', url2);
    console.log('请求的URL4:', url4);

    $.when($.getJSON(url2), $.getJSON(url4)).done(function(data2Response, data4Response) {
        const data2 = data2Response[0].data;
        const data4 = data4Response[0].data;
        handleData(data1, data2, data4, 'range');
    }).fail(function() {
        alert('查询失败，请检查输入的信息');
    });
}

function handleData(data1, data2, data3, dateType) {
    console.log('handleData 数据:', { data1, data2, data3 });
    let dailyData = [];

    if (dateType === 'range' && data2 && typeof data2 === 'object' && data3 && typeof data3 === 'object') {
        dailyData = Object.keys(data2).map(date => {
            const weekday = new Date(date.slice(0, 4), date.slice(4, 6) - 1, date.slice(6)).toLocaleDateString('zh-CN', { weekday: 'long' });
            const drzhzc = data2[date] !== undefined ? data2[date] : '无数据';
            const yk = data3[date] !== undefined ? data3[date] : '无数据';
            return { date, drzhzc, yk, weekday };
        });
    }

    $('#result').html(`
        <h2>资产数据</h2>
        <p>客户号: ${data1.data.khh}</p >
        <p>客户姓名: ${data1.data.khxm}</p >
        <p>股票持仓金额: ${data1.data.gpccje}</p >  
        <p>场内基金持仓金额: ${data1.data.jjccje}</p >
        <p>场外基金持仓金额: ${data1.data.cwjjccje}</p >
        <p>资管产品持仓金额: ${data1.data.zgccje}</p >
        <p>债卷持仓金额: ${data1.data.zqccje}</p >
        <p>期权持仓金额: ${data1.data.qqccje}</p >
        <p>金融产品持仓金额: ${data1.data.jrcpccje}</p >
        <p>融资融卷持仓: ${data1.data.rzrqccje}</p >
        <p>账户资金余额: ${data1.data.zhzjye}</p >
        <p>可用资金: ${data1.data.kyzj}</p >
        <p>冻结资金: ${data1.data.djzj}</p >
        <p>待交收: ${data1.data.djs}</p >
        <p>总资产: ${data1.data.zzc}</p >
        <p>买入成交金额: ${data1.data.mrcjje}</p >
        <p>卖出成交金额: ${data1.data.mccjje}</p >
        <p>融资融卷负债: ${data1.data.rzrqfz}</p >
        <p>证券账户总资产: ${data1.data.zhzc !== undefined ? data1.data.zhzc : 'undefined'}</p >
        ${dateType === 'single' && data3 ? `
        <h2>单日盈亏数据</h2>
        <p>当日账户资产: ${data3.drzhzc !== undefined ? data3.drzhzc : '无数据'}</p >
        <p>上日账户资产: ${data3.srzhzc !== undefined ? data3.srzhzc : '无数据'}</p >
        <p>盈亏: ${data3.yk !== undefined ? data3.yk : '无数据'}</p >
        ` : ''}
        ${dateType === 'range' && dailyData.length > 0 ? `
        <h2>日期范围内的每天数据</h2>
        ${dailyData.map(item => `
            <p>日期: ${item.date} (${item.weekday})</p >
            <p>当日总资产: ${item.drzhzc !== undefined ? item.drzhzc : '无数据'}</p >
            <p>当天收益: ${item.yk !== undefined ? item.yk : '无数据'}</p >
        `).join('<br>')}
        ` : ''}
    `);
}


