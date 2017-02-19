module.exports = VirtualText;

function VirtualText(text) {
    this.text = text;
}

VirtualText.prototype.type = "VirtualText";
VirtualText.prototype.isVText = true;