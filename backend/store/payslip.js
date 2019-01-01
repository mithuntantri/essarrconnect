var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var request = require('request');
var fs = require('fs');
var pdf = require('html-pdf');
var options = { 
	"format": 'Letter', 
	"base": "file:///home/mithuntantri/mithuntantri/essarrconnect/backend",
	"border": {
	    "top": "0.25in",
	    "right": "0.5in",
	    "bottom": "0.25in",
	    "left": "0.5in"
	},
};

// var employee = {
// 	'first_name': 'Vidya Shankar',
// 	'last_name': 'N V',
// 	'designation': 'Manager',
// 	'department': 'Sales',
// 	'effective_working_days': 31,
// 	'loss_of_pay': 0,
// 	'employee_number': 'EA001',
// 	'location': 'Bengaluru',
// 	'bank_name': 'AXIS Bank',
// 	'bank_account_number': '9160100016734',
// 	'pan_number': 'CHGPM3605L',
// 	'uan_number': '101068098995',
// 	'epf_number': 'BGBNG15556920000010035',
// 	'esic_number': '5344900788',
// 	'gross_income': 54366,
// 	'basic': 20000,
// 	'hra': 0,
// 	'professional_tax': 200,
// 	'incentives': 5000,
// 	'loss_of_pay_days': 0
// }

var calculations = {
	'provident_fund': 0.12, //12% of Basic
	'employee_state_insurance': 0.0175, //1.75% of Basic,
	'tax_deducation_at_source': 0
}

var GenerateHTML = (tds, employee)=>{
	var html = fs.readFileSync('./views/payslip.html', 'utf8');
	html = html.replace("{{name}}", employee.first_name + ' ' + employee.last_name)
	html = html.replace("{{employee_number}}", employee.employee_id)
	html = html.replace("{{designation}}", employee.designation)
	html = html.replace("{{bank_name}}", employee.bank_name)
	html = html.replace("{{location}}", employee.location)
	html = html.replace("{{effective_working_days}}", employee.effective_working_days)
	html = html.replace("{{loss_of_pay_days}}", employee.loss_of_pay_days)
	html = html.replace("{{department}}", employee.department?employee.department:'NA')
	html = html.replace("{{bank_account_number}}", employee.account_number)
	html = html.replace("{{pan_number}}", employee.pan_number?employee.pan_number:'NA')
	html = html.replace("{{uan_number}}", employee.uan_number?employee.uan_number:'NA')
	html = html.replace("{{epf_number}}", employee.epf_number?employee.epf_number:'NA')
	html = html.replace("{{basic_pay}}", employee.basic)
	html = html.replace("{{other_allowance}}", employee.other_allowance)
	html = html.replace("{{gross_income}}", employee.gross_income)
	html = html.replace("{{incentives}}", employee.incentives)
	html = html.replace("{{total_earnings}}", employee.total_earnings)
	html = html.replace("{{professional_tax}}", employee.professional_tax)
	html = html.replace("{{tds}}", employee.tax_deducation_at_source)
	html = html.replace("{{hra}}", employee.hra)
	html = html.replace("{{epf}}", employee.provident_fund)
	html = html.replace("{{esic}}", employee.employee_state_insurance)
	html = html.replace("{{loss_of_pay_amount}}", employee.loss_of_pay_amount)
	html = html.replace("{{total_deductions}}", employee.total_deductions)
	html = html.replace("{{net_pay_for_the_month}}", employee.net_income)
	html = html.replace("{{net_pay_for_the_month_figures}}", employee.net_income_figures)

	html = html.replace("{{basic_gross}}", tds.basic.gross)
	html = html.replace("{{basic_exempt}}", tds.basic.exempt)
	html = html.replace("{{basic_taxable}}", tds.basic.taxable)
	html = html.replace("{{hra_gross}}", tds.hra.gross)
	html = html.replace("{{hra_exempt}}", tds.hra.exempt)
	html = html.replace("{{hra_taxable}}", tds.hra.taxable)
	html = html.replace("{{other_gross}}", tds.other_allowance.gross)
	html = html.replace("{{other_exempt}}", tds.other_allowance.exempt)
	html = html.replace("{{other_taxable}}", tds.other_allowance.taxable)

	html = html.replace("{{annual_gross}}", tds.annual_gross)
	html = html.replace("{{annual_prof_tax}}", tds.annual_prof_tax)
	html = html.replace("{{total_80c_deduction}}", tds.total_80c_deduction)
	html = html.replace("{{total_income}}", tds.total_income)
	html = html.replace("{{tax_to_be_deducted}}", tds.tax_to_be_deducted)
	html = html.replace("{{monthly_projected_tax}}", tds.monthly_projected_tax)
	console.log(html)
	return html
}

var CalculateTDS = (employee)=>{
	var tds = {
		basic : {
			gross: 0,
			exempt: 0,
			taxable: 0
		},
		hra: {
			gross: 0,
			exempt: 0,
			taxable: 0
		},
		other_allowance: {
			gross: 0,
			exempt: 0,
			taxable: 0
		},
		annual_gross: 0,
		total_income: 0,
		total_tax: 0,
		education_cess: 0,
		tax_deducation_prev_employer: 0,
		tax_deducted_till_date: 0,
		tax_to_be_deducted: 0,
		monthly_projected_tax: 0
	}
	let month_diff = Math.floor(moment([2018, 4, 1]).diff(moment(), 'months', true) * -1)
	tds.basic.gross = employee.basic * month_diff
	tds.basic.taxable = tds.basic.gross

	tds.other_allowance.gross = employee.other_allowance * month_diff
	tds.other_allowance.taxable = tds.other_allowance.gross

	tds.annual_gross = employee.gross_income * 12
	tds.annual_prof_tax = employee.professional_tax * 12
	tds.total_80c_deduction = (employee.employee_state_insurance * 12) + (employee.provident_fund * 12)

	tds.total_income = tds.annual_gross - tds.annual_prof_tax - tds.total_80c_deduction

	if((tds.total_income-250000) > 0){
		tds.tax_to_be_deducted = (tds.total_income-250000) * 5 / 100
	}else{
		tds.tax_to_be_deducted = 0
	}

	tds.monthly_projected_tax = (tds.tax_to_be_deducted / (12 - month_diff)).toFixed(2)
	return tds
}

var GeneratePaylsip = (employee_id, month, year)=>{

	return new Promise((resolve, reject)=>{
		let query1 = `SELECT * FROM employees e INNER JOIN salaries s WHERE e.employee_id=s.employee_id and e.employee_id='${employee_id}'`
		let query2 = `SELECT * FROM incentives WHERE employee_id='${employee_id}' and date LIKE '%${month} ${year}'`
		let query3 = `SELECT b.name FROM branches b INNER JOIN employees e WHERE b.id=e.location_id AND e.employee_id='${employee_id}'`
		console.log(query1, query2)
		sqlQuery.executeQuery([query1, query3, query2]).then((result)=>{
			let employee = result[0][0]
			let branch = result[1][0]
			console.log("branch", branch)
			employee.incentives = 0
			employee.professional_tax = 200
			employee.loss_of_pay_days = 0
			employee.location = 'NA'

			if(branch){
				employee.location = branch.name				
			}

			if(result[2][0]){
				employee.incentives = result[2][0].amount
			}
			employee.effective_working_days = moment().daysInMonth();

			employee.provident_fund = employee.basic * calculations.provident_fund
			if(employee.gross_income < 21000){
				employee.employee_state_insurance = parseFloat((employee.basic * calculations.employee_state_insurance).toFixed(2))				
			}else{
				employee.employee_state_insurance = 0
			}
			employee.tax_deducation_at_source = employee.basic * calculations.tax_deducation_at_source
			employee.total_deductions = employee.professional_tax + employee.provident_fund + employee.employee_state_insurance + employee.tax_deducation_at_source
			
			employee.total_earnings = employee.gross_income + employee.incentives

			employee.net_income = employee.gross_income - employee.total_deductions + employee.incentives

			employee.other_allowance = employee.gross_income - employee.basic - employee.total_deductions
			employee.per_day_income = employee.gross_income / employee.effective_working_days
			employee.loss_of_pay_amount = employee.loss_of_pay_days * employee.per_day_income
			employee.net_income_figures = 'Rupees ' + inWords(parseInt(employee.net_income))

			console.log(employee)

			let destination_file = `./payslips/${employee.employee_id}_${month}(${year}).pdf`
			let tds = CalculateTDS(employee)
			console.log("tds", tds)
			let source_html = GenerateHTML(tds, employee)
			pdf.create(source_html, options).toFile(destination_file, function(err, res) {
			  console.log(err)
			  console.log(res)
			  if (err) {
			  	reject(err);
			  }
			  console.log(res);
			  resolve()
			});
		}).catch((err)=>{
			reject(err)
		})
	})
}

var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

module.exports = {
	GeneratePaylsip: GeneratePaylsip
}