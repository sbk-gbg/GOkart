// Copyright (C) 2016 Göteborgs Stad
//
// Denna programvara är fri mjukvara: den är tillåten att distribuera och modifiera
// under villkoren för licensen CC-BY-NC-SA 4.0.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the CC-BY-NC-SA 4.0 licence.
//
// http://creativecommons.org/licenses/by-nc-sa/4.0/
//
// Det är fritt att dela och anpassa programvaran för valfritt syfte
// med förbehåll att följande villkor följs:
// * Copyright till upphovsmannen inte modifieras.
// * Programvaran används i icke-kommersiellt syfte.
// * Licenstypen inte modifieras.
//
// Den här programvaran är öppen i syfte att den skall vara till nytta för andra
// men UTAN NÅGRA GARANTIER; även utan underförstådd garanti för
// SÄLJBARHET eller LÄMPLIGHET FÖR ETT VISST SYFTE.
//
// https://github.com/hajkmap/Hajk

var InfoButton = React.createClass({
  render: function () {
    var title = this.props.checked ? "Dölj tooltip" : "Visa lagerinformation";
    var className = this.props.checked ? "fa fa-info-circle" : "fa fa-info-circle";
    var fontSize = this.props.checked ? "18px" : "18px";
    return (
       <span className="clickable pull-right" title={title} style={{ position: 'relative', top: '3px', marginRight: '14px' }}>
          <i className={className} style={{ fontSize: fontSize }}></i>
       </span>
    );
  }
});

module.exports = InfoButton;