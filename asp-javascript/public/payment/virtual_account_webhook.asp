<%@ Language="VBScript" %>

<!--#include file="json2.asp"-->

<%
' Function to convert bytes to string
Function BytesToStr(bytes)
    Dim Stream
    Set Stream = Server.CreateObject("Adodb.Stream")
    
    Stream.Type = 1 ' adTypeBinary
    Stream.Open
    Stream.Write bytes
    
    Stream.Position = 0
    Stream.Type = 2 ' adTypeText
    Stream.Charset = "utf-8"
    
    BytesToStr = Stream.ReadText
    
    Stream.Close
    Set Stream = Nothing
End Function

' Reading binary data from the request
Dim lngBytesCount, jsonText
lngBytesCount = Request.TotalBytes
jsonText = BytesToStr(Request.BinaryRead(lngBytesCount))

' Setting the response content type
Response.ContentType = "text/html"

' Parsing the JSON data
Set myJSON = JSON.parse(jsonText)

secret = myJSON.secret
status = myJSON.status
orderId = myJSON.orderId

' TODO: 결제 승인 응답으로 받아 서버에 저장해 둔 secret 과 같은지 확인하세요. 다르면 처리하지 마세요.
' 예시)
' savedSecret = FindSavedSecret(orderId) ' 결제 승인 때 저장한 secret
' If IsEmpty(savedSecret) Or savedSecret <> secret Then
'     Response.Status = "400 Bad Request"
'     Response.End
' End If

' TODO: 결제 조회 API(GET /v1/payments/orders/{orderId})로 결제 상태를 한 번 더 확인한 뒤 주문 상태를 바꾸세요.

' 받은 값을 다시 출력하지 말고, 잘 받았다는 응답만 보내세요.
Response.Status = "200 OK"

%>
