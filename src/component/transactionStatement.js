import React, { Component } from "react";
import { Button, Icon, Input, Card, Table } from 'antd';
import TransactionModal from './transactionModal';
import 'antd/dist/antd.css';
import storage from '../utils/Storage';
import config from '../config.js';
import axios from 'axios';

class TransactionStatement extends Component {

    constructor(props) {
      super(props);
      this.state = {
        transactions: [],
        token: false,
        showForm: false,
        transactionAmount: '',
        transactionDescription: '',
        transactionTimestamp: '',
        error: '',
        loading: true,
        visible: false
      }
      this.showForm = this.showForm.bind(this);
      this.handleTransactionAmount = this.handleTransactionAmount.bind(this);
      this.handleTransactionDescription = this.handleTransactionDescription.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.onDelete = this.onDelete.bind(this);
    }
  
    showForm() {
      this.setState( (state) => ({
        showForm: !state.showForm
      }));
    }
  
    handleTransactionAmount(event) {
      this.setState({
        transactionAmount: event.target.value
      });
    }
  
    handleTransactionDescription(event) {
      this.setState({
        transactionDescription: event.target.value
      });
    }
  
    handleSubmit(e) {
      e.preventDefault();
  
      /**
       * Validate user input
       */
      if(isNaN(this.state.transactionAmount)) {
  
        this.setState({
          error: 'Amount must be numbers',
        });
        this.forceUpdate();
        return;
  
      } else if (this.state.transactionAmount === '' || this.state.transactionDescription === '') {
  
        this.setState({
          error: 'All fileds are required',
        });
        this.forceUpdate();
        return;
  
      } else {
  
        this.setState({
          error: '',
        });
        this.forceUpdate();
  
      }
  
      this.setState({
        loading: true
      });
  
      this.forceUpdate();
  
      /**
       * AJAX call to create a new transaction
       */
      axios({
  
        method: 'post',
        url: config.base_url+'api/v1/transaction',
        data: {
          amount: parseFloat(this.state.transactionAmount),
          description: this.state.transactionDescription
        },
        headers: {
          'Authorization': 'Bearer ' + storage.getAuthToken()
        }
  
      })
        .then( (response) => {
  
          this.setState( prevState => ({
            transactions: [...prevState.transactions, response.data.data],
            loading: false
          }));
  
          this.forceUpdate();
  
        })
        .catch( (error) => {
          
          console.log(error);
  
          this.setState({
            error: 'Server Error: Please contact administrator',
            loading: false
          });
  
        });
    }
  
    componentDidMount() {
  
      /**
       * AJAX call to get transactions from server
       */
      axios({
        method: 'get',
        url: config.base_url+'api/v1/transaction',
        headers: {
          'Authorization': 'Bearer ' + storage.getAuthToken()
        }
      })
      .then( (response) => {
  
        this.setState({
          transactions: response.data.data.reverse(),
          loading: false
        })
      })
      .catch( (error) => {
  
        console.log(error);
  
        this.setState({
          error: 'Server Error: Please contact administrator',
          loading: false
        });
  
        this.forceUpdate();
  
      });
  
    }

    onDelete(id, index) {
      
      this.setState({
        loading: true
      });
  
      this.forceUpdate();

      // delete transactions from database using ajax
      axios({
        method: 'delete',
        url: config.base_url+'/api/v1/transaction/'+id,
        headers: {
          'Authorization': 'Bearer ' + storage.getAuthToken()
        },
        data: null
      }).then( (response) => {
        // delete transactions directly from DOM
        var tmpTransactions = this.state.transactions;
        tmpTransactions.splice(index, 1);
        this.setState( prevState => ({
          transactions: tmpTransactions,
          loading: false
        }));

        this.forceUpdate();

      }).catch( (error) => {

        console.log(error);
  
        this.setState({
          error: 'Server Error: Please contact administrator',
          loading: false
        });
  
        this.forceUpdate();

      });

    }

    onEdit(id, index) {

      this.setState({
        visible: true
      });

      this.forceUpdate();

    }

    handleOk() {
      this.setState({
          visible: false
      });
    }

    handleCancel() {
      this.setState({
          visible: false
      });
    }
  
    render() {
      /**
       * Styles
       */
      const thStyle = {
        fontSize: '20pt',
        color: '#2f4b6a',
        textAlign: 'left'
      }
  
      const tableStyle = {
        borderCollapse: 'collapse' ,
        width: '100%',
        padding: '10pt',
      }
  
      const timeStyle = {
        fontSize: '18pt',
        color: '#362010',
        textAlign: 'left'
      }
  
      const amountStyle = {
        fontSize: '18pt',
        color: '#002928',
        textAlign: 'left'
      }
  
      const descriptionStlye = {
        fontSize: '18pt',
        textAlign: 'left'
      }
  
      const secStyle = {
        fontSize: '18pt',
        color: '#367371',
        textAlign: 'left'
      }
  
      /**
       * Data
       */

      const columns = [
        {
          title: 'Transaction Date',
          dataIndex: 'timestamp',
          key: 'timestamp'
        },
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount'
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description'
        },
        {
          title: 'actions',
          dataIndex: '',
          key: 'actions',
          render: (text, record, index) => (
            <div>
              <Button type="info" onClick={this.onEdit.bind(this, text.id, index)}> Edit </Button>
              <Button type="danger" onClick={this.onDelete.bind(this,text.id, index)}> Delete </Button>
            </div>
          )
        },
      ]
  
      /**
       * Table
       */
      const content = (
        <div>
        <div>
        <Button type="primary" size="large" onClick={this.showForm}><Icon type="form" theme="outlined" />Add New Transaction</Button> <br/><br/>
        <form style={{display: this.state.showForm ? 'inline-block' : 'none'}}>
          <span> Transaction Amount </span><Input type="text" onChange={this.handleTransactionAmount}/><br/>
          <span> Transaction Description </span><Input type="text" onChange={this.handleTransactionDescription}/><br/><br/>
          <Button id="submitButton" onClick={this.handleSubmit}> Submit </Button><br/>
        </form>
        <div id="error" style={{color: 'red'}}> {this.state.error} </div>
        </div>
  
        <Card loading={this.state.loading}>

          <Table dataSource={this.state.transactions} columns={columns} />

        </Card>

        <TransactionModal visible={this.state.visible} 
        handleOk={this.handleOk.bind(this)} handleCancel={this.handleCancel.bind(this)}
        > </TransactionModal>

        </div>
      );
  
      return content;
    }
}
  
export default TransactionStatement;
