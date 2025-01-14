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

' Outputting the parsed JSON data
Response.Write "Secret : " & myJSON.secret & "<br>"
Response.Write "Status : " & myJSON.status & "<br>"
Response.Write "orderID : " & myJSON.orderId & "<br>"

%>
