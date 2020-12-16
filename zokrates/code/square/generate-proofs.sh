#!/bin/bash

for NUM in {1..11}
do
    
    squared=$(($NUM * $NUM))
    filepath="witness-$NUM-$squared"
    proof_path="proof-$NUM.json"
    ~/zokrates compute-witness -a $NUM $squared -o $filepath
    ~/zokrates generate-proof -w $filepath -j $proof_path
done