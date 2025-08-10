import streamlit as st
import pandas as pd

if "mdf" not in st.session_state:
    st.session_state.mdf = pd.DataFrame(columns=['Location', 'X', 'Y', 'Demand', 'From', 'To', 'Service', 'Vehicle', 'Capacity'])

col0, col1, col2, col3, col4, col5, col6, col7, col8, col9= st.columns(10)
idx= col0.text_input('Idx')
location = col1.text_input('Name')
x = col2.text_input('X Coo' )
y = col3.text_input('Y Coo' )
demand = col4.text_input('Demand' )
from_ = col5.text_input('From')
to = col6.text_input('To' )
service = col7.text_input('Service' )
vehicle = col8.text_input('Vehicle' )
capacity = col9.text_input('Capacity' )

run = st.button('Submit')

df_new = pd.DataFrame({'Location': location, 
                            'X': x, 
                            'Y': y, 
                            'Demand': demand, 
                            'From': from_, 
                            'To': to,
                            'Service': service, 
                            'Vehicle': vehicle, 
                            'Capacity': capacity}, index=[idx])    
        
if run:
    st.session_state.mdf = pd.concat([st.session_state.mdf, df_new], axis=0)
    st.dataframe(st.session_state.mdf)

st.write(f"Total Rows: {st.session_state.mdf.shape[0]}")