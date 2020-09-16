      *> CobolPreProcessor Rech v1.8
      *> Opções: C:\TMP\Diagnostic\cassel\SRIC10.CBL -cpn -spn -sco -msi -vnp -war -wes -cem -wop=w077;w078;w079 -dc=f:\Fontes\;.\;C:\TMP\Diagnostic\cassel\;F:\SIGER\wc\des\cassel\fon\;F:\FONTES -mem
*>-cp>     copy                   configoo.cpy replacing ==(nomprg)== by sric10                                          *>      11      11
*>-cp>                                                   =="NOMPRG"== by "SRIC10".                                       *>      12      12
      >>set constant w78-oriobj "S"                                                                                      *>      17       5 configoo.cpy (1)
       identification             division.                                                                              *>      19       7 configoo.cpy (1)
*>-pp>$if w78-herda-classe defined                                                                                       *>      21       9 configoo.cpy (1)
*>-pp>$else                                                                                                              *>      23      11 configoo.cpy (1)
       class-id.                  sric10.                                                                                *>      24      12 configoo.cpy (1)
