//
//  ContentView.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/21/26.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    
    public var currentTheme: MainSpinTheme = MainSpinTheme()
    
    var body: some View {
        VStack {
            HStack {
                Button(action: {}) {
                    Image(systemName: "bell")
                        .font(.system(size: 23))
                }
                .padding([.trailing, .bottom], 2)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .buttonStyle(.glass)
                .buttonBorderShape(.circle)
            }
            .padding([.trailing])
            
            VStack {
                HomeNavButton(action: {}, title: "Browse Latest Releases", assetName: "vinyl")
                HomeNavButton(action: {}, title: "Manage Notification Targets", assetName: "alarm")
                HomeNavButton(action: {}, title: "Manage User Information", assetName: "settings")
            }
            .padding([.top], 5)
        }
        .font(currentTheme.font)
        .padding(.top, 10)
        .foregroundStyle(.black)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(currentTheme.mainColor)
    }
}

struct HomeNavButton: View {
    let action: () -> Void
    let title: String
    let assetName: String
    
    var body: some View {
        VStack {
            Button(action: action) {
                HStack {
                    Text(title)
                        .padding(.leading, 3)
                    Spacer()
                    Image(assetName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 35, height: 35)
                        .padding(.trailing, 5)
                }
                .padding(.all, 10)
                .overlay(RoundedRectangle(cornerRadius:8)
                    .stroke(Orange400, lineWidth: 1.5)
                )
                .background(
                    LinearGradient(colors: [Slate300, .white, Slate300], startPoint: .top, endPoint: .bottom),
                    in: RoundedRectangle(cornerRadius: 8)
                )
                .shadow(radius: 2, y: 1)
            }
            .padding([.bottom, .leading, .trailing], 7)
        }
    }
}


#Preview {
    ContentView()
}
