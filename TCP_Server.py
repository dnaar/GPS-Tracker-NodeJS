import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

server_socket.bind(('192.168.0.15', 8080))
server_socket.listen()

sockets_list = [server_socket]
clients = {}

HEADER_LENGTH = 5

def receive_message(client_socket):
    try:
        message_header = client_socket.recv(HEADER_LENGTH)
        if not len(message_header):
            return False
        message_length = int(message_header.decode('utf-8').strip())
        return {"header" : message_header, "data": client_socket.recv(message_length)}
    except:
        return False


while True:
    client_socket, client_address = server_socket.accept()

    msg = receive_message(client_socket)
    if msg is False:
        continue
    sockets_list.append(client_socket)
    ##Función para reenviar los datos al server.
    message = msg['data'].decode('utf-8').split(",")
    print(f"message desde {client_address} = {message}")
    ##
    client_socket.close()
    print(f"Conexion terminada:{client_address}")