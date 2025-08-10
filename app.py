import streamlit as st
import pandas as pd


if "mdf" not in st.session_state:
    st.session_state.mdf = pd.DataFrame(columns=['retirement', 'brokerage', 'savings',
                                                  'age', 'retirement_age', 'expenses', 'rate_of_return',
                                                    'inflation'])


#@st.cache_data
st.write('Welcome to my FIRE calculator. ')


sidebar = st.sidebar.selectbox('Make your view selection', ('Inputs','Results'))

if sidebar == 'Inputs':

    col0, col1, col2, col3, col4, col5, col6, col7= st.columns(8)

    retirement= col0.text_input('Retirement accounts')
    brokerage = col1.text_input('Brokerage accounts')
    savings = col2.text_input('Savings accounts' )
    age = col3.text_input('Age' )
    retirement_age = col4.text_input('Retirement Age' )
    expenses = col5.text_input('Expenses when you retire')
    rate_of_return = col6.text_input('Rate of Return' )
    inflation = col7.text_input('Inflation Rate' )

        
    run = st.button('Submit')

    df_new = pd.DataFrame({'retirement': retirement, 
                                'brokerage': brokerage, 
                                'savings': savings, 
                                'age': age, 
                                'retirement_age': retirement_age, 
                                'expenses': expenses,
                                'rate_of_return': rate_of_return, 
                                'inflation': inflation}, index=[0]
                                )    
            
    if run:
        st.session_state.mdf = pd.concat([st.session_state.mdf, df_new], axis=0)
        st.dataframe(st.session_state.mdf)

    st.write(f"Total Rows: {st.session_state.mdf.shape[0]}")    