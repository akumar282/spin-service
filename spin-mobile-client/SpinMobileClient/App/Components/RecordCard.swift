//
//  RecordCard.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/27/26.
//

import SwiftUI

struct RecordCard: View {
    let artist: String
    let album: String
    let color: String
    let genre: [String]
    let storeLink: String
    var image: String?
    let preOrder: Bool
    let tag: String
    
    
    
    var body: some View {
        VStack {
            HStack {
                Text(tag)
            }
            Image(image ?? "NotFoundImage")
            
        }
    }
}
