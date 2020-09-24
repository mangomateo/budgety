
/*--------------------------
 BUDGET CONTROLLER
 ---------------------------  */
var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Calculate an expense item's percentage of total income
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // Return the percentage
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }


      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, desc, val);
      } else if (type ==='inc') {
        newItem = new Income(ID, desc, val);
      }

      // Push result into data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      // Loop over all the items in the array type
        ids = data.allItems[type].map(function(current) {
          return current.id;
        });

        index = ids.indexOf(id);

        if (index !== -1) {
          data.allItems[type].splice(index, 1);
        };
    },

    calculateBudget: function() {

      // 1. Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // 2. Calculate the budget (income - expense)
      data.budget = data.totals.inc - data.totals.exp;

      // 3. Calculate the percentntage of income that was spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    // Run the getPercentage() method on each item of the exp array
    getPercentages: function() {
      var allPct = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });


      return allPct;
    },

    getBudget: function() {
      return {
        budget:     data.budget,
        totalInc:   data.totals.inc,
        totalExp:   data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  }

})();










/*--------------------------
 UI CONTROLLER
 ---------------------------  */
var interfaceController = (function() {

  var DOMstrings = {
    inputType:            '.add__type',
    inputDescription:     '.add__description',
    inputValue:           '.add__value',
    inputButton:          '.add__btn',
    incomeContainer:      '.income__list',
    expenseContainer:     '.expenses__list',
    budgetLabel:          '.budget__value',
    incomeLabel:          '.budget__income--value',
    expensesLabel:        '.budget__expenses--value',
    percentageLabel:      '.budget__expenses--percentage',
    container:            '.container',
    expensesPctLabel:     '.item__percentage'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    // 1. '+ ' or '- ' before the formatNumber
    // 2. EXACTLY 2 decimal points
    // 3. A comma separating thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  // Some code
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Can be INC or EXP
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    getDOMstrings: function() {
      return DOMstrings;
    },

    addListItem: function(obj, type) {
      var html, newHTML, element;

      // 1. Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // 2. Replace placeholder text with actual data
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      // 3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll(DOMstrings.expensesPctLabel);

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {

        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }

      });

    }

  };

}());













/*--------------------------
 GLOBAL APPLICATION CONTROLLER
 ---------------------------  */
var controller = (function(budgetCtrl, interfaceCtrl) {

  var setupEventListeners = function() {
    var DOM = interfaceCtrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };

  var updateBudget = function() {
    var budget;

    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    interfaceCtrl.displayBudget(budget);
  };

  var updatePercentages = function() {

    // 1. Calculate the percentages
    budgetCtrl.calculatePercentages();

    //2. Read them from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    interfaceCtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the field input data
    input = interfaceCtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget CONTROLLER
      newItem = budgetController.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      interfaceCtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      interfaceCtrl.clearFields();

      // 5. Calculate and update the budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();

    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    // Select the id of a specific line item
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    // Split the item type from its ID
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete item from the UI
      interfaceCtrl.deleteListItem(itemID);

      // 3. Update and display the new budget
      updateBudget();

      // 4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log('The application has started.');
      setupEventListeners();
      interfaceCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  }

})(budgetController, interfaceController);

controller.init();
