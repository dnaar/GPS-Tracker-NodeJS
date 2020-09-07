import socket
import pandas as pd   

server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_socket.bind(('192.168.0.15', 10840))


while True:
    data, addr = server_socket.recvfrom(1024)
    message = data.decode("utf-8").split(',')

    #Función para reenviar los datos del listener.
    rec_Coordinates = pd.DataFrame({
    'Latitud':[float(message[0])],
    'Longitud':[float(message[1])],
    'Time Stamp':[message[2]]})
    #Writting csv file with last data received
    rec_Coordinates.to_csv('./Web_Page/MyWebApp/coordinates.csv')

    print(message)
    print(addr)
