//
//  SeeMore.swift
//  spin-mobile-client
//
//  Created by Abhi on 11/3/26.
//
import SwiftUI

struct SeeMore: View {
    
    var body: some View {
        Button(action: {}) {
            Text("Get Notified")
                .font(.custom("JetBrainsMono-Regular", size: 12))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 5)
            VStack {
                
            }
        }
        .frame(width: 190, height: 276)
        .background {
            LinearGradient(
                colors: [Slate300, .white, Slate300],
                startPoint: .top,
                endPoint: .bottom
            )
        }
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay {
            RoundedRectangle(cornerRadius: 10)
                .stroke(Orange400, lineWidth: 1.5)
                .shadow(radius: 2, y: 1)
        }
        .padding(2)
    }
}
