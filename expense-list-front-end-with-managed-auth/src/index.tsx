// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.

// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at

//    http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied. See the License for the
// specific language governing permissions and limitations
// under the License.

import Cookies from 'js-cookie';
import React, { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import { getExpenses } from "./api/expenses/get-expenses";
import { Expense } from "./api/expenses/types/expense";
import groupBy from "lodash/groupBy";
import AddItem from "./components/modal/fragments/add-item";
import { deleteExpenses } from "./api/expenses/delete-expenses";
import { Dictionary } from "lodash";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [readList, setReadList] = useState<Dictionary<Expense[]> | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [readList2, setReadList2] = useState<any>(null);
  const [data, setData] = useState([]); //[{ title: 'title1', date: '04/15/2024', category: 'Recurring', amount: '100' }];

  useEffect(() => {
    if (Cookies.get('userinfo')) {
      // We are here after a login
      const userInfoCookie = Cookies.get('userinfo')
      sessionStorage.setItem("userInfo", userInfoCookie);
      Cookies.remove('userinfo');
      var userInfo = JSON.parse(atob(userInfoCookie));
      setSignedIn(true);
      setUser(userInfo);
    } else if (sessionStorage.getItem("userInfo")) {
      // We have already logged in
      var userInfo = JSON.parse(atob(sessionStorage.getItem("userInfo")!));
      setSignedIn(true);
      setUser(userInfo);
    } else {
      console.log("User is not signed in");
    }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    // Handle errors from Managed Authentication
    const errorCode = new URLSearchParams(window.location.search).get('code');
    const errorMessage = new URLSearchParams(window.location.search).get('message');
    if (errorCode) {
      toast.error(<>
        <p className="text-[16px] font-bold text-slate-800">Something went wrong !</p>
        <p className="text-[13px] text-slate-400 mt-1">Error Code : {errorCode}<br />Error Description: {errorMessage}</p>
      </>);    
    }
  }, []);

  useEffect(() => {
    getReadingList();
  }, [signedIn]);

  async function getReadingList() {
    if (signedIn) {
      setIsLoading(true);
      getExpenses()
        .then((res) => {
          //setReadList2(res.data);
          //setData(res);
          const grouped = groupBy(res.data, (item) => item.category);
          setReadList(grouped);
          setIsLoading(false);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  useEffect(() => {
    if (!isAddItemOpen) {
      getReadingList();
    }
  }, [isAddItemOpen]);

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    await deleteExpenses(id);
    getReadingList();
    setIsLoading(false);
  };

  if (isAuthLoading) {
    return <div className="animate-spin h-5 w-5 text-white">.</div>;
  }

  if (!signedIn) {
    return (
      <button
        className="float-right bg-black bg-opacity-20 p-2 rounded-md text-sm my-3 font-medium text-white"
        onClick={() => { window.location.href = "/auth/login" }}
      >
        Login
      </button>
    );
  }

  return (
    <div className="header-2 w-screen h-screen overflow-hidden">
      <nav className="bg-white py-2 md:py-2">
        <div className="container px-4 mx-auto md:flex md:items-center">
          <div className="flex justify-between items-center">
            {user && (
              <a href="#" className="font-bold text-xl text-[#36d1dc]">
                {user?.org_name}
              </a>
            )}
            <button
              className="border border-solid border-gray-600 px-3 py-1 rounded text-gray-600 opacity-50 hover:opacity-75 md:hidden"
              id="navbar-toggle"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>

          <div
            className="hidden md:flex flex-col md:flex-row md:ml-auto mt-3 md:mt-0"
            id="navbar-collapse"
          >
            <button
              className="float-right bg-[#15af1c] p-2 rounded-md text-sm my-3 font-medium text-white"
              onClick={() => {
                sessionStorage.removeItem("userInfo");
                window.location.href = `/auth/logout?session_hint=${Cookies.get('session_hint')}`;
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      { <div className="py-3 md:py-6">
        <div className="container px-4 mx-auto flex justify-center">
          <div className="w-full max-w-lg px-2 py-16 sm:px-0 mb-20">
            <div className="flex justify-between">
              <p className="text-4xl text-white mb-3 font-bold">Expenses</p>
              <div className="container w-auto">
                <button
                  className="float-right bg-black bg-opacity-20 p-2 rounded-md text-sm my-3 font-medium text-white h-10"
                  onClick={() => setIsAddItemOpen(true)}
                >
                  + Add New
                </button>
                <button
                  className="float-right bg-black bg-opacity-20 p-2 rounded-md text-sm my-3 font-medium text-white w-10 h-10 mr-1"
                  onClick={() => getReadingList()}
                >
                  <ArrowPathIcon />
                </button>
              </div>
            </div>
            <table id="explist">
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Action</th>
                </tr>
                {/* {data.map((expenses) => {
                    return ( 
                        <tr>
                            <td>{expenses.date}</td>
                            <td>{expenses.title}</td>
                            <td>{expenses.category}</td>
                            <td>{expenses.amount}</td>
                        </tr>
                    )
                })} */}
                {readList && (Object.values(readList).map((expenses: Expense[], idx) => (
                        expenses.map((expense) => (
                          <tr>
                            <td>{expense.date}</td>
                            <td>{expense.title}</td>
                            <td>{expense.category}</td>
                            <td>{expense.amount}</td>
                            <td>
                            <button
                              className="float-right bg-red-500 text-white rounded-md self-center text-xs p-2 mr-2"
                              onClick={() => handleDelete(expense.uuid!)}
                            >
                              Delete
                            </button>
                            </td>
                        </tr>
                        ))

                  )))}
            </table>
            <AddItem isOpen={isAddItemOpen} setIsOpen={setIsAddItemOpen} />
          </div>
        </div>
      </div>  }
    </div>
  );
}
